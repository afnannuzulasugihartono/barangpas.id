// Vercel menyuntikkan environment variable saat build/runtime Edge.
declare const process: { env: Record<string, string | undefined> };

export const config = {
  runtime: 'edge',
}

type Status = 'AMAN' | 'HANTU' | 'MATI'
type Confidence = 'tinggi' | 'sedang' | 'rendah'

type PreviousSnapshot = {
  sellerCommissionRate?: number
  price?: number
}

type CheckResult = {
  url: string
  resolvedUrl?: string
  status: Status
  productName: string
  estimatedLoss: number
  estimatedLossBasis: 'history' | 'default-5%' | 'none'
  shopId?: string
  itemId?: string
  price?: number
  sellerCommissionRate?: number
  confidence: Confidence
  source: 'affiliate-api' | 'item-api' | 'html' | 'resolver'
  error?: string
}

type AffiliateNode = {
  itemId?: string | number
  shopId?: string | number
  productName?: string
  priceMin?: string | number
  sellerCommissionRate?: string | number
  shopeeCommissionRate?: string | number
  commissionRate?: string | number
  productLink?: string
}

type Identity = { shopId: string; itemId: string }

type RequestBody =
  | string[]
  | {
      urls?: string[]
      previous?: Record<string, PreviousSnapshot>
    }

const FREE_LIMIT = 30
const HARD_LIMIT = 300
const DEFAULT_MONTHLY_ORDERS = 10
const DEFAULT_LOST_XTRA_RATE = 0.05
const AFFILIATE_ENDPOINT = 'https://open-api.affiliate.shopee.co.id/graphql'

const SHORTLINK_HOSTS = new Set([
  's.shopee.co.id',
  'shope.ee',
  's.id',
  'barangpas.id',
  'www.barangpas.id',
])

const encoder = new TextEncoder()

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  })
}

function parseShopeeUrl(input: string): Identity | null {
  const raw = input.trim()
  const slug = raw.match(/(?:-|\b)i\.(\d+)\.(\d+)(?:\D|$)/i)
  if (slug) return { shopId: slug[1], itemId: slug[2] }

  const product = raw.match(/\/product\/(\d+)\/(\d+)(?:[/?#]|$)/i)
  if (product) return { shopId: product[1], itemId: product[2] }

  try {
    const url = new URL(raw)
    const shopId = url.searchParams.get('shopid') ?? url.searchParams.get('shop_id')
    const itemId = url.searchParams.get('itemid') ?? url.searchParams.get('item_id')
    if (shopId && itemId && /^\d+$/.test(shopId) && /^\d+$/.test(itemId)) {
      return { shopId, itemId }
    }
  } catch {
    return null
  }

  return null
}

function keyOf(identity: Identity) {
  return `${identity.shopId}.${identity.itemId}`
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 7000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function fetchRetry(url: string, init: RequestInit = {}, timeoutMs = 7000) {
  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, init, timeoutMs)
      if (response.status !== 429 && response.status < 500) return response
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    if (attempt === 0) await sleep(350)
  }
  throw lastError instanceof Error ? lastError : new Error('Fetch gagal')
}

async function resolveShortLink(rawUrl: string): Promise<string | null> {
  try {
    const parsed = new URL(rawUrl)
    if (!SHORTLINK_HOSTS.has(parsed.hostname.toLowerCase())) return null

    // GET dipakai karena beberapa shortener tidak mengizinkan HEAD.
    const response = await fetchRetry(rawUrl, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
        accept: 'text/html,application/xhtml+xml',
      },
    }, 6000)

    const finalUrl = response.url
    if (finalUrl && /(^|\.)shopee\.co\.id$/i.test(new URL(finalUrl).hostname)) {
      return finalUrl
    }

    // Fallback ringan: cari satu URL Shopee di HTML shortener milik sendiri / s.id.
    const html = await response.text().catch(() => '')
    const match = html.match(/https?:\/\/(?:www\.)?shopee\.co\.id\/[^"'<>\s]+/i)
    return match?.[0] ?? null
  } catch {
    return null
  }
}

function normalizeRate(value: unknown): number {
  const n = typeof value === 'string' ? Number.parseFloat(value) : Number(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  return n > 1 ? n / 100 : n
}

function normalizeAffiliatePrice(value: unknown): number {
  const n = typeof value === 'string' ? Number.parseFloat(value) : Number(value)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function normalizePublicPrice(value: unknown): number {
  const n = typeof value === 'string' ? Number.parseFloat(value) : Number(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  // Endpoint item/get Shopee historis memakai skala 100.000 untuk IDR.
  return n >= 100_000_000 ? Math.round(n / 100_000) : n
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function affiliateRequest(query: string): Promise<Record<string, { nodes?: AffiliateNode[] }> | null> {
  const appId = process.env.SHOPEE_AFFILIATE_APP_ID
  const secret = process.env.SHOPEE_AFFILIATE_SECRET
  if (!appId || !secret) return null

  const payload = JSON.stringify({ query })
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = await sha256Hex(`${appId}${timestamp}${payload}${secret}`)

  const response = await fetchRetry(AFFILIATE_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `SHA256 Credential=${appId}, Timestamp=${timestamp}, Signature=${signature}`,
    },
    body: payload,
  }, 9000)

  if (!response.ok) throw new Error(`Affiliate API HTTP ${response.status}`)
  const body = (await response.json()) as {
    data?: Record<string, { nodes?: AffiliateNode[] }>
    errors?: Array<{ message?: string }>
  }
  if (body.errors?.length) throw new Error(body.errors[0]?.message || 'Affiliate API error')
  return body.data ?? null
}

async function fetchAffiliateBatch(items: Array<{ identity: Identity; index: number }>) {
  if (!process.env.SHOPEE_AFFILIATE_APP_ID || !process.env.SHOPEE_AFFILIATE_SECRET) {
    return new Map<number, AffiliateNode | null>()
  }

  // GraphQL alias: 10 produk = 1 HTTP request. Jauh lebih cepat daripada 300 request terpisah.
  const fields = items.map(({ identity, index }) => `
    p${index}: productOfferV2(itemId: ${identity.itemId}, shopId: ${identity.shopId}, page: 1, limit: 1) {
      nodes {
        itemId
        shopId
        productName
        priceMin
        sellerCommissionRate
        shopeeCommissionRate
        commissionRate
        productLink
      }
    }
  `).join('\n')

  const data = await affiliateRequest(`query XtraHantuBatch { ${fields} }`)
  const map = new Map<number, AffiliateNode | null>()
  for (const item of items) {
    const node = data?.[`p${item.index}`]?.nodes?.[0] ?? null
    map.set(item.index, node)
  }
  return map
}

function deepHasXtra(value: unknown, seen = new Set<unknown>()): boolean {
  if (value == null) return false
  if (typeof value === 'string') return /komisi\s*xtra|xtra[_\s-]?commission|badge[_\s-]?xtra/i.test(value)
  if (typeof value !== 'object') return false
  if (seen.has(value)) return false
  seen.add(value)

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (/xtra/i.test(key)) {
      if (typeof child === 'boolean' && child) return true
      if (typeof child === 'number' && child > 0) return true
      if (typeof child === 'string' && child !== '' && child !== '0' && child.toLowerCase() !== 'false') return true
      if (child && typeof child === 'object') return true
    }
    if (deepHasXtra(child, seen)) return true
  }
  return false
}

async function fetchPublicItem(identity: Identity) {
  const endpoint = `https://shopee.co.id/api/v4/item/get?itemid=${identity.itemId}&shopid=${identity.shopId}`
  try {
    const response = await fetchRetry(endpoint, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
        accept: 'application/json,text/plain,*/*',
        'x-api-source': 'pc',
      },
    }, 6500)

    if (response.status === 404 || response.status === 410) {
      return { alive: false, hardDead: true, name: '', price: 0, hasXtra: false }
    }

    if (!response.ok) throw new Error(`item/get HTTP ${response.status}`)
    const body = (await response.json()) as { data?: Record<string, unknown> | null }
    const data = body.data
    if (!data) return { alive: false, hardDead: false, name: '', price: 0, hasXtra: false }

    const status = String(data.item_status ?? '').toLowerCase()
    const alive = !['deleted', 'banned', 'unlisted'].includes(status)
    return {
      alive,
      hardDead: !alive,
      name: String(data.name ?? ''),
      price: normalizePublicPrice(data.price ?? data.price_min ?? 0),
      hasXtra: deepHasXtra(data),
    }
  } catch (error) {
    return {
      alive: false,
      hardDead: false,
      name: '',
      price: 0,
      hasXtra: false,
      error: error instanceof Error ? error.message : 'item/get gagal',
    }
  }
}

async function fetchHtml(url: string) {
  try {
    const response = await fetchRetry(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36',
        accept: 'text/html,application/xhtml+xml',
      },
    }, 6500)
    if (response.status === 404 || response.status === 410) return { alive: false, hardDead: true, hasXtra: false }
    if (!response.ok) throw new Error(`HTML HTTP ${response.status}`)
    const html = await response.text()
    return {
      alive: html.length > 500,
      hardDead: false,
      hasXtra: /komisi\s*xtra|xtra[_\s-]?commission|badge[_\s-]?xtra/i.test(html),
    }
  } catch (error) {
    return {
      alive: false,
      hardDead: false,
      hasXtra: false,
      error: error instanceof Error ? error.message : 'HTML gagal',
    }
  }
}

function estimateLoss(price: number, previous: PreviousSnapshot | undefined) {
  if (price <= 0) return { amount: 0, basis: 'none' as const }
  const historicalRate = normalizeRate(previous?.sellerCommissionRate)
  const rate = historicalRate || DEFAULT_LOST_XTRA_RATE
  return {
    amount: Math.round(price * rate * DEFAULT_MONTHLY_ORDERS),
    basis: historicalRate ? ('history' as const) : ('default-5%' as const),
  }
}

async function classifyFallback(
  originalUrl: string,
  resolvedUrl: string,
  identity: Identity,
  previous?: PreviousSnapshot,
  affiliateNode?: AffiliateNode | null,
): Promise<CheckResult> {
  const publicItem = await fetchPublicItem(identity)
  const affiliateName = affiliateNode?.productName || ''
  const affiliatePrice = normalizeAffiliatePrice(affiliateNode?.priceMin)
  const publicName = publicItem.name || affiliateName || `Produk ${identity.itemId}`
  const price = affiliatePrice || publicItem.price || previous?.price || 0

  if (publicItem.hardDead) {
    return {
      url: originalUrl,
      resolvedUrl,
      status: 'MATI',
      productName: publicName,
      estimatedLoss: 0,
      estimatedLossBasis: 'none',
      shopId: identity.shopId,
      itemId: identity.itemId,
      price,
      confidence: 'tinggi',
      source: 'item-api',
    }
  }

  // Affiliate API tersedia: sellerCommissionRate adalah sinyal utama XTRA.
  if (affiliateNode) {
    const sellerRate = normalizeRate(affiliateNode.sellerCommissionRate)
    if (sellerRate > 0) {
      return {
        url: originalUrl,
        resolvedUrl,
        status: 'AMAN',
        productName: publicName,
        estimatedLoss: 0,
        estimatedLossBasis: 'none',
        shopId: identity.shopId,
        itemId: identity.itemId,
        price,
        sellerCommissionRate: sellerRate,
        confidence: 'tinggi',
        source: 'affiliate-api',
      }
    }

    if (publicItem.alive) {
      const loss = estimateLoss(price, previous)
      return {
        url: originalUrl,
        resolvedUrl,
        status: 'HANTU',
        productName: publicName,
        estimatedLoss: loss.amount,
        estimatedLossBasis: loss.basis,
        shopId: identity.shopId,
        itemId: identity.itemId,
        price,
        sellerCommissionRate: 0,
        confidence: 'tinggi',
        source: 'affiliate-api',
      }
    }
  }

  // Tanpa kredensial resmi, hormati requirement awal: cari sinyal XTRA di JSON publik.
  if (publicItem.alive && publicItem.hasXtra) {
    return {
      url: originalUrl,
      resolvedUrl,
      status: 'AMAN',
      productName: publicName,
      estimatedLoss: 0,
      estimatedLossBasis: 'none',
      shopId: identity.shopId,
      itemId: identity.itemId,
      price,
      confidence: 'sedang',
      source: 'item-api',
    }
  }

  const html = await fetchHtml(resolvedUrl)
  if (html.hardDead) {
    return {
      url: originalUrl,
      resolvedUrl,
      status: 'MATI',
      productName: publicName,
      estimatedLoss: 0,
      estimatedLossBasis: 'none',
      shopId: identity.shopId,
      itemId: identity.itemId,
      price,
      confidence: 'tinggi',
      source: 'html',
    }
  }

  if (html.alive && html.hasXtra) {
    return {
      url: originalUrl,
      resolvedUrl,
      status: 'AMAN',
      productName: publicName,
      estimatedLoss: 0,
      estimatedLossBasis: 'none',
      shopId: identity.shopId,
      itemId: identity.itemId,
      price,
      confidence: 'sedang',
      source: 'html',
    }
  }

  // Produk masih bisa dibuka tapi tidak ditemukan bukti XTRA => HANTU.
  if (publicItem.alive || html.alive) {
    const loss = estimateLoss(price, previous)
    return {
      url: originalUrl,
      resolvedUrl,
      status: 'HANTU',
      productName: publicName,
      estimatedLoss: loss.amount,
      estimatedLossBasis: loss.basis,
      shopId: identity.shopId,
      itemId: identity.itemId,
      price,
      confidence: process.env.SHOPEE_AFFILIATE_APP_ID ? 'sedang' : 'rendah',
      source: publicItem.alive ? 'item-api' : 'html',
      error: publicItem.error || html.error,
    }
  }

  // Timeout/403/429 bukan bukti produk mati. Tandai HANTU confidence rendah agar tidak false-MATI.
  const loss = estimateLoss(price, previous)
  return {
    url: originalUrl,
    resolvedUrl,
    status: 'HANTU',
    productName: publicName,
    estimatedLoss: loss.amount,
    estimatedLossBasis: loss.basis,
    shopId: identity.shopId,
    itemId: identity.itemId,
    price,
    confidence: 'rendah',
    source: 'item-api',
    error: publicItem.error || html.error || 'Shopee menolak/timeout; cek ulang hasil ini.',
  }
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>) {
  const results = new Array<R>(items.length)
  let cursor = 0

  async function runner() {
    while (true) {
      const index = cursor++
      if (index >= items.length) break
      results[index] = await worker(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner))
  return results
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Gunakan POST.' }, 405)

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return json({ error: 'Body JSON tidak valid.' }, 400)
  }

  const urls = Array.isArray(body) ? body : body.urls ?? []
  const previous = Array.isArray(body) ? {} : body.previous ?? {}
  const uniqueUrls = [...new Set(urls.map((url) => String(url).trim()).filter(Boolean))]

  if (uniqueUrls.length === 0) return json({ error: 'Tidak ada URL untuk dicek.' }, 400)
  if (uniqueUrls.length > HARD_LIMIT) return json({ error: `Maksimal ${HARD_LIMIT} link per scan.` }, 400)

  const proKey = request.headers.get('x-pro-key') || ''
  const serverProKey = process.env.PRO_ACCESS_KEY || ''
  const isPro = Boolean(serverProKey && proKey && proKey === serverProKey)
  if (!isPro && uniqueUrls.length > FREE_LIMIT) {
    return json({ error: 'PAYWALL', freeLimit: FREE_LIMIT, total: uniqueUrls.length }, 402)
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`))

      try {
        send({ type: 'meta', total: uniqueUrls.length, officialApi: Boolean(process.env.SHOPEE_AFFILIATE_APP_ID && process.env.SHOPEE_AFFILIATE_SECRET) })

        // Resolve short-link bukan request ke Shopee, jadi boleh lebih paralel agar feedback cepat.
        const prepared = await mapPool(uniqueUrls, 15, async (originalUrl, index) => {
          let resolvedUrl = originalUrl
          let identity = parseShopeeUrl(resolvedUrl)
          if (!identity) {
            const resolved = await resolveShortLink(originalUrl)
            if (resolved) {
              resolvedUrl = resolved
              identity = parseShopeeUrl(resolvedUrl)
            }
          }
          return { index, originalUrl, resolvedUrl, identity }
        })

        // Query official API dalam batch 20, maksimum 5 batch bersamaan.
        const withIdentity = prepared.filter((item): item is typeof item & { identity: Identity } => Boolean(item.identity))
        const affiliateByIndex = new Map<number, AffiliateNode | null>()
        if (process.env.SHOPEE_AFFILIATE_APP_ID && process.env.SHOPEE_AFFILIATE_SECRET) {
          const batches: Array<Array<{ identity: Identity; index: number }>> = []
          for (let i = 0; i < withIdentity.length; i += 20) {
            batches.push(withIdentity.slice(i, i + 20).map((item) => ({ identity: item.identity, index: item.index })))
          }

          const batchMaps = await mapPool(batches, 5, async (batch) => {
            try {
              return await fetchAffiliateBatch(batch)
            } catch {
              return new Map<number, AffiliateNode | null>()
            }
          })
          for (const batchMap of batchMaps) {
            for (const [index, node] of batchMap.entries()) affiliateByIndex.set(index, node)
          }
        }

        let completed = 0
        let ghostCount = 0
        let totalLoss = 0

        await mapPool(prepared, 5, async (item) => {
          let result: CheckResult
          if (!item.identity) {
            result = {
              url: item.originalUrl,
              resolvedUrl: item.resolvedUrl,
              status: 'MATI',
              productName: 'Link tidak dikenali / bukan link produk Shopee',
              estimatedLoss: 0,
              estimatedLossBasis: 'none',
              confidence: 'rendah',
              source: 'resolver',
              error: 'Tidak menemukan shopId + itemId.',
            }
          } else {
            const prior = previous[keyOf(item.identity)]
            const affiliateNode = affiliateByIndex.get(item.index)

            // Fast path: seller commission > 0 = AMAN, tidak perlu panggil item/get.
            if (affiliateNode && normalizeRate(affiliateNode.sellerCommissionRate) > 0) {
              result = {
                url: item.originalUrl,
                resolvedUrl: item.resolvedUrl,
                status: 'AMAN',
                productName: affiliateNode.productName || `Produk ${item.identity.itemId}`,
                estimatedLoss: 0,
                estimatedLossBasis: 'none',
                shopId: item.identity.shopId,
                itemId: item.identity.itemId,
                price: normalizeAffiliatePrice(affiliateNode.priceMin),
                sellerCommissionRate: normalizeRate(affiliateNode.sellerCommissionRate),
                confidence: 'tinggi',
                source: 'affiliate-api',
              }
            } else {
              result = await classifyFallback(
                item.originalUrl,
                item.resolvedUrl,
                item.identity,
                prior,
                affiliateNode,
              )
            }
          }

          completed += 1
          if (result.status === 'HANTU') {
            ghostCount += 1
            totalLoss += result.estimatedLoss
          }
          send({ type: 'result', index: item.index, completed, result })
        })

        send({ type: 'summary', completed, ghostCount, totalLoss })
      } catch (error) {
        send({ type: 'fatal', error: error instanceof Error ? error.message : 'Terjadi error tidak dikenal.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'application/x-ndjson; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}
