export type ShopeeIdentity = {
  shopId: string
  itemId: string
}

/**
 * Mengambil shopId + itemId dari format URL Shopee yang umum.
 * Mendukung:
 * - https://shopee.co.id/nama-produk-i.123.456
 * - https://shopee.co.id/nama-produk-i.123.456?...
 * - https://shopee.co.id/product/123/456
 * - URL dengan ?shopid=123&itemid=456
 */
export function parseShopeeUrl(input: string): ShopeeIdentity | null {
  const raw = input.trim()
  if (!raw) return null

  // Format slug paling umum: -i.{shopId}.{itemId} atau i.{shopId}.{itemId}
  const slugMatch = raw.match(/(?:-|\b)i\.(\d+)\.(\d+)(?:\D|$)/i)
  if (slugMatch) {
    return { shopId: slugMatch[1], itemId: slugMatch[2] }
  }

  // Format /product/{shopId}/{itemId}
  const productMatch = raw.match(/\/product\/(\d+)\/(\d+)(?:[/?#]|$)/i)
  if (productMatch) {
    return { shopId: productMatch[1], itemId: productMatch[2] }
  }

  try {
    const url = new URL(raw)
    const shopId = url.searchParams.get('shopid') ?? url.searchParams.get('shop_id')
    const itemId = url.searchParams.get('itemid') ?? url.searchParams.get('item_id')
    if (shopId && itemId && /^\d+$/.test(shopId) && /^\d+$/.test(itemId)) {
      return { shopId, itemId }
    }
  } catch {
    // Bukan URL lengkap. Biarkan null agar backend bisa mencoba resolve short-link.
  }

  return null
}

export function productKey(identity: ShopeeIdentity): string {
  return `${identity.shopId}.${identity.itemId}`
}

export function splitUrls(text: string): string[] {
  const candidates = text
    .split(/[\s,]+/g)
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => /^https?:\/\//i.test(value))

  return [...new Set(candidates)]
}
