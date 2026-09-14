import { useEffect, useMemo, useState } from 'react'
import { parseShopeeUrl, productKey, splitUrls } from './lib/parseShopee'

type Status = 'AMAN' | 'HANTU' | 'MATI'
type Confidence = 'tinggi' | 'sedang' | 'rendah'

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
  source: string
  error?: string
}

type Snapshot = {
  sellerCommissionRate?: number
  price?: number
  productName?: string
  checkedAt?: string
}

type History = Record<string, Snapshot>

const HISTORY_KEY = 'xtra-hantu-history-v1'
const PRO_KEY_STORAGE = 'xtra-hantu-pro-key'
const FREE_LIMIT = 30
const PAYWALL_URL = import.meta.env.VITE_LYNK_PAYWALL_URL || 'https://lynk.id/barangpas'

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function loadHistory(): History {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}') as History
  } catch {
    return {}
  }
}

function downloadCsv(results: CheckResult[]) {
  const rows = [
    ['Nama Produk', 'Status', 'Estimasi Rugi', 'Confidence', 'URL'],
    ...results.map((item) => [
      item.productName,
      item.status,
      String(item.estimatedLoss),
      item.confidence,
      item.resolvedUrl || item.url,
    ]),
  ]

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `xtra-hantu-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [text, setText] = useState('')
  const [results, setResults] = useState<CheckResult[]>([])
  const [checking, setChecking] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [message, setMessage] = useState('')
  const [showPaywall, setShowPaywall] = useState(false)
  const [officialApi, setOfficialApi] = useState<boolean | null>(null)

  useEffect(() => {
    // Lynk.id bisa diarahkan ke /?pro=KUNCI. Kunci disimpan lokal lalu URL dibersihkan.
    const params = new URLSearchParams(window.location.search)
    const pro = params.get('pro')
    if (pro) {
      localStorage.setItem(PRO_KEY_STORAGE, pro)
      params.delete('pro')
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`
      window.history.replaceState({}, '', next)
    }
  }, [])

  const urls = useMemo(() => splitUrls(text), [text])
  const ghosts = useMemo(() => results.filter((item) => item.status === 'HANTU'), [results])
  const dead = useMemo(() => results.filter((item) => item.status === 'MATI'), [results])
  const safe = useMemo(() => results.filter((item) => item.status === 'AMAN'), [results])
  const totalLoss = useMemo(() => ghosts.reduce((sum, item) => sum + item.estimatedLoss, 0), [ghosts])

  async function copyGhostLinks() {
    const value = ghosts.map((item) => item.url).join('\n')
    await navigator.clipboard.writeText(value)
    setMessage(`${ghosts.length} link HANTU disalin.`)
  }

  function shareWhatsApp() {
    const maxGhostLinks = 20
    const sharedGhosts = ghosts.slice(0, maxGhostLinks)
    const lines = [
      '👻 XTRA HANTU — Hasil Scan',
      `Dicek: ${results.length}`,
      `✅ AMAN: ${safe.length}`,
      `👻 HANTU: ${ghosts.length}`,
      `💀 MATI: ${dead.length}`,
      `💸 Est. rugi/bulan: ${rupiah.format(totalLoss)}`,
    ]

    if (sharedGhosts.length > 0) {
      lines.push('', 'Link HANTU:')
      lines.push(...sharedGhosts.map((item, index) => `${index + 1}. ${item.url}`))
      if (ghosts.length > sharedGhosts.length) {
        lines.push(`… +${ghosts.length - sharedGhosts.length} link HANTU lainnya (lihat CSV).`)
      }
    }

    lines.push('', `Cek dengan XTRA HANTU: ${window.location.origin}`)
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  async function check() {
    setMessage('')
    setShowPaywall(false)

    if (urls.length === 0) {
      setMessage('Paste minimal 1 link Shopee dulu.')
      return
    }
    if (urls.length > 300) {
      setMessage('Maksimal 300 link per scan.')
      return
    }

    const proKey = localStorage.getItem(PRO_KEY_STORAGE) || ''
    if (!proKey && urls.length > FREE_LIMIT) {
      setShowPaywall(true)
      return
    }

    const history = loadHistory()
    setChecking(true)
    setResults([])
    setProgress({ done: 0, total: urls.length })

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(proKey ? { 'x-pro-key': proKey } : {}),
        },
        body: JSON.stringify({ urls, previous: history }),
      })

      if (response.status === 402) {
        setShowPaywall(true)
        return
      }
      if (!response.ok) {
        const error = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(error.error || `HTTP ${response.status}`)
      }
      if (!response.body) throw new Error('Browser tidak mendukung response streaming.')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      const nextResults = new Map<number, CheckResult>()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line) as {
            type: string
            index?: number
            completed?: number
            total?: number
            officialApi?: boolean
            result?: CheckResult
            error?: string
          }

          if (event.type === 'meta') {
            setOfficialApi(Boolean(event.officialApi))
            setProgress((prev) => ({ ...prev, total: event.total || prev.total }))
          }

          if (event.type === 'result' && event.result && typeof event.index === 'number') {
            nextResults.set(event.index, event.result)
            setResults([...nextResults.entries()].sort((a, b) => a[0] - b[0]).map((entry) => entry[1]))
            setProgress((prev) => ({ ...prev, done: event.completed || prev.done + 1 }))

            const result = event.result
            if (result.shopId && result.itemId && result.status === 'AMAN' && (result.sellerCommissionRate || 0) > 0) {
              const key = productKey({ shopId: result.shopId, itemId: result.itemId })
              history[key] = {
                sellerCommissionRate: result.sellerCommissionRate,
                price: result.price,
                productName: result.productName,
                checkedAt: new Date().toISOString(),
              }
              localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
            }
          }

          if (event.type === 'fatal') throw new Error(event.error || 'Scan berhenti.')
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal mengecek link.')
    } finally {
      setChecking(false)
    }
  }

  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-50 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <div className="mb-3 text-5xl">👻</div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">XTRA HANTU</h1>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">Paste sampai 300 link. Cari produk hidup yang Komisi XTRA-nya menghilang.</p>
        </header>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-2xl shadow-black/30 sm:p-6">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste 300 link Shopee di sini..."
            className="min-h-64 w-full resize-y rounded-2xl border border-zinc-700 bg-zinc-950 p-4 text-sm leading-6 text-zinc-100 outline-none transition focus:border-violet-500 sm:min-h-72"
          />

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <span>{urls.length} link terbaca</span>
            <span>Free 30 • Pro 300/batch</span>
          </div>

          <button
            onClick={check}
            disabled={checking || urls.length === 0}
            className="mt-4 w-full rounded-2xl bg-violet-500 px-5 py-4 text-base font-black text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
          >
            {checking ? `MENCARI HANTU... ${percent}%` : 'CEK HANTU 👻'}
          </button>

          {checking && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-violet-500 transition-all" style={{ width: `${percent}%` }} />
            </div>
          )}

          {message && <p className="mt-3 text-center text-sm text-amber-300">{message}</p>}

          {showPaywall && (
            <div className="mt-4 rounded-2xl border border-violet-500/40 bg-violet-500/10 p-4 text-center">
              <p className="font-bold">Free maksimal 30 link.</p>
              <p className="mt-1 text-sm text-zinc-300">Pro membuka 300 link per batch, tanpa batas jumlah scan dan tanpa login.</p>
              <a
                href={PAYWALL_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-black text-zinc-950"
              >
                BUKA PRO DI LYNK.ID ↗
              </a>
            </div>
          )}
        </section>

        {results.length > 0 && (
          <section className="mt-6">
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="DICEK" value={`${results.length}/${progress.total}`} />
              <Stat label="AMAN" value={String(safe.length)} />
              <Stat label="HANTU" value={String(ghosts.length)} danger />
              <Stat label="EST. RUGI/BULAN" value={rupiah.format(totalLoss)} danger />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => downloadCsv(results)} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-bold hover:bg-zinc-900">Download CSV</button>
              <button onClick={copyGhostLinks} disabled={ghosts.length === 0} className="rounded-xl border border-zinc-700 px-3 py-2 text-sm font-bold hover:bg-zinc-900 disabled:opacity-40">Copy link hantu saja</button>
              <button onClick={shareWhatsApp} className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20">Bagikan ke WhatsApp</button>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-800">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Nama Produk</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Estimasi Rugi</th>
                      <th className="px-4 py-3">Ganti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                    {results.map((item, index) => (
                      <tr key={`${item.url}-${index}`}>
                        <td className="max-w-xl px-4 py-3">
                          <div className="font-semibold text-zinc-100">{item.productName}</div>
                          <div className="mt-1 truncate text-xs text-zinc-600" title={item.error || item.url}>
                            {item.error ? `⚠ ${item.error}` : item.url}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusPill status={item.status} confidence={item.confidence} />
                        </td>
                        <td className="px-4 py-3 font-bold">{item.estimatedLoss ? rupiah.format(item.estimatedLoss) : '—'}</td>
                        <td className="px-4 py-3">
                          <a
                            href={`https://shopee.co.id/search?keyword=${encodeURIComponent(item.productName)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-lg bg-zinc-100 px-3 py-2 text-xs font-black text-zinc-950 hover:bg-white"
                          >
                            Ganti ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-xs text-zinc-500">
              <p>Estimasi rugi = komisi XTRA historis × harga × asumsi 10 order/bulan. Jika belum ada histori, fallback konservatif 5%.</p>
              <p>Mode deteksi: {officialApi ? 'Affiliate Open API resmi + fallback publik' : 'fallback publik saja — tambahkan App ID + Secret untuk akurasi tertinggi'}.</p>
              {dead.length > 0 && <p>{dead.length} link MATI ditemukan.</p>}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function Stat({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${danger ? 'border-rose-500/30 bg-rose-500/10' : 'border-zinc-800 bg-zinc-900/70'}`}>
      <div className="text-[11px] font-bold tracking-widest text-zinc-500">{label}</div>
      <div className={`mt-1 text-xl font-black ${danger ? 'text-rose-300' : 'text-zinc-100'}`}>{value}</div>
    </div>
  )
}

function StatusPill({ status, confidence }: { status: Status; confidence: Confidence }) {
  const style = status === 'AMAN'
    ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
    : status === 'HANTU'
      ? 'bg-violet-500/15 text-violet-300 ring-violet-500/30'
      : 'bg-zinc-700/50 text-zinc-300 ring-zinc-600'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ring-1 ${style}`} title={`Confidence: ${confidence}`}>
      {status === 'HANTU' ? '👻 ' : ''}{status}{confidence === 'rendah' ? ' ⚠' : ''}
    </span>
  )
}
