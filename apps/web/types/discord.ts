export interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: Array<{
    name: string
    value: string
    inline?: boolean
  }>
  thumbnail?: { url: string }
  timestamp?: string
  footer?: { text: string }
}

export interface DiscordWebhookPayload {
  content?: string
  embeds: DiscordEmbed[]
}
