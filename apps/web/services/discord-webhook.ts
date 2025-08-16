import type { DiscordEmbed, DiscordWebhookPayload } from "@/types/discord"

export class DiscordWebhookService {
  private static readonly userinfoWebhookUrl = process.env.DISCORD_USERINFO
  private static readonly donationWebhookUrl = process.env.DISCORD_DONATION

  private static coerce(value: unknown, fallback: string): string {
    try {
      const raw = value ?? ""
      const str = typeof raw === "string" ? raw : String(raw)
      const trimmed = str.trim()
      return trimmed.length > 0 ? trimmed : fallback
    } catch {
      return fallback
    }
  }

  /**
   * Sends a Discord webhook notification with an embed
   */
  static async sendWebhook(
    content: string = "",
    embed: DiscordEmbed,
    type: "userinfo" | "donation",
  ): Promise<boolean> {
    if (type === "userinfo" && !this.userinfoWebhookUrl) {
      console.warn("Discord webhook URL not configured")
      return false
    }
    if (type === "donation" && !this.donationWebhookUrl) {
      console.warn("Discord webhook URL not configured")
      return false
    }

    const webhookUrl =
      type === "userinfo" ? this.userinfoWebhookUrl : this.donationWebhookUrl

    if (!webhookUrl) {
      console.warn("Discord webhook URL not configured")
      return false
    }

    try {
      const payload: DiscordWebhookPayload = {
        content: content,
        embeds: [embed],
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error(
          "Failed to send Discord webhook:",
          response.status,
          response.statusText,
        )
        return false
      }

      return true
    } catch (error) {
      console.error("Error sending Discord webhook:", error)
      return false
    }
  }

  /**
   * Sends notification for avatar upload
   */
  static async notifyAvatarUpload(
    user: {
      id: number
      name: string | null | undefined
      email: string | null | undefined
    },
    avatarUrl: string,
  ): Promise<void> {
    const safeName = this.coerce(user?.name, `User #${user.id}`)
    const safeEmail = this.coerce(user?.email, "N/A")
    const embed: DiscordEmbed = {
      title: "🖼️ Avatar Upload",
      description: `User **${safeName}** has uploaded a new avatar`,
      color: 0x00ff00, // Green
      fields: [
        {
          name: "User ID",
          value: user.id.toString(),
          inline: true,
        },
        {
          name: "Email",
          value: safeEmail,
          inline: true,
        },
        {
          name: "Action",
          value: "Avatar Upload",
          inline: true,
        },
      ],
      thumbnail: {
        url: avatarUrl,
      },
      timestamp: new Date().toISOString(),
      footer: {
        text: "Account System",
      },
    }

    await this.sendWebhook("<" + avatarUrl + ">", embed, "userinfo")
  }

  /**
   * Sends notification for Gravatar import
   */
  static async notifyGravatarImport(
    user: {
      id: number
      name: string | null | undefined
      email: string | null | undefined
    },
    avatarUrl: string,
  ): Promise<void> {
    const safeName = this.coerce(user?.name, `User #${user.id}`)
    const safeEmail = this.coerce(user?.email, "N/A")
    const embed: DiscordEmbed = {
      title: "📥 Gravatar Import",
      description: `User **${safeName}** has imported their Gravatar`,
      color: 0x0099ff, // Blue
      fields: [
        {
          name: "User ID",
          value: user.id.toString(),
          inline: true,
        },
        {
          name: "Email",
          value: safeEmail,
          inline: true,
        },
        {
          name: "Action",
          value: "Gravatar Import",
          inline: true,
        },
      ],
      thumbnail: {
        url: avatarUrl,
      },
      timestamp: new Date().toISOString(),
      footer: {
        text: "Account System",
      },
    }

    await this.sendWebhook("<" + avatarUrl + ">", embed, "userinfo")
  }

  /**
   * Sends notification for username change
   */
  static async notifyUsernameChange(
    user: {
      id: number
      name: string | null | undefined
      email: string | null | undefined
    },
    oldUsername: string | null | undefined,
    newUsername: string | null | undefined,
  ): Promise<void> {
    const safeEmail = this.coerce(user?.email, "N/A")
    const safeOld = this.coerce(oldUsername, "(not set)")
    const safeNew = this.coerce(newUsername, "(not set)")
    const embed: DiscordEmbed = {
      title: "✏️ Username Change",
      description: `User has changed their username`,
      color: 0xffaa00, // Orange
      fields: [
        {
          name: "User ID",
          value: user.id.toString(),
          inline: true,
        },
        {
          name: "Email",
          value: safeEmail,
          inline: true,
        },
        {
          name: "Old Username",
          value: safeOld,
          inline: true,
        },
        {
          name: "New Username",
          value: safeNew,
          inline: true,
        },
        {
          name: "Action",
          value: "Username Change",
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Account System",
      },
    }

    await this.sendWebhook("", embed, "userinfo")
  }

  static async notifyDonationRequest(
    user: {
      id: number
      name: string | null | undefined
      email: string | null | undefined
    },
    donationId: string | null | undefined,
    paypalEmail: string | null | undefined,
    discordUsername: string | null | undefined,
  ): Promise<void> {
    const safeName = this.coerce(user?.name, `User #${user.id}`)
    const safeEmail = this.coerce(user?.email, "N/A")
    const safeDonationId = this.coerce(donationId, "N/A")
    const safePaypal = this.coerce(paypalEmail, "N/A")
    const safeDiscord = this.coerce(discordUsername, "N/A")
    const embed: DiscordEmbed = {
      title: "💰 Donation Validation Request",
      description: `User **${safeName}** has requested a donation validation`,
      color: 0xffd700, // Gold
      fields: [
        {
          name: "User ID",
          value: user.id.toString(),
          inline: true,
        },
        {
          name: "Donation ID",
          value: safeDonationId,
          inline: true,
        },
        {
          name: "PayPal Email",
          value: safePaypal,
          inline: true,
        },
        {
          name: "Discord Username",
          value: safeDiscord,
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "VIP Donation System",
      },
    }

    await this.sendWebhook("", embed, "donation")
  }
}
