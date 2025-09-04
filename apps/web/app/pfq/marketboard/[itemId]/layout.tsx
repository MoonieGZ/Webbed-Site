import type { Metadata } from "next"
import { PFQApiService } from "@/services/pfq-api"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ itemId: string }>
}): Promise<Metadata> {
  const siteName = "Moonsy's Webbed Site"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mnsy.dev"
  const { itemId } = await params
  const itemIdNum = Number(itemId)

  const fallbackTitle = `${siteName}`
  const fallbackDescription =
    "A comprehensive collection of useful tools for everyone."

  if (!Number.isFinite(itemIdNum) || itemIdNum < 1) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: `${baseUrl}/pfq/marketboard/${itemId}`,
        siteName,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
      },
    }
  }

  const serverApiKey = process.env.PFQ_SERVER_API_KEY || ""

  if (!serverApiKey) {
    const title = `Marketboard trends for item #${itemIdNum} | ${siteName}`
    const description =
      "Explore historical prices, recent listings, and summary stats for this PFQ marketboard item."
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/pfq/marketboard/${itemIdNum}`,
        siteName,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    }
  }

  try {
    const itemRes = await PFQApiService.getMarketboardItemByItemId(
      serverApiKey,
      itemIdNum,
    )

    const item = itemRes.success ? itemRes.data : null
    const itemName = item?.name || `Item #${itemIdNum}`
    const title = `Marketboard trends for ${itemName} | ${siteName}`
    const description = item
      ? `Category: ${item.category}. View price trends, recent listings, and stats for ${itemName}.`
      : "Explore historical prices, recent listings, and summary stats for this PFQ marketboard item."

    // Prefer item sprite if available; otherwise build a simple placeholder image route
    const ogImage = item?.sprite ? item.sprite : undefined

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/pfq/marketboard/${itemIdNum}`,
        siteName,
        type: "article",
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
    }
  } catch {
    const title = `Marketboard trends for item #${itemIdNum} | ${siteName}`
    const description =
      "Explore historical prices, recent listings, and summary stats for this PFQ marketboard item."
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/pfq/marketboard/${itemIdNum}`,
        siteName,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    }
  }
}

export default function MarketboardItemLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
