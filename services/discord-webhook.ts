import type { DiscordEmbed, DiscordWebhookPayload } from "@/types/discord"

export class DiscordWebhookService {
  private static readonly webhookUrl = process.env.DISCORD_USERINFO

  /**
   * Sends a Discord webhook notification with an embed
   */
  static async sendWebhook(
    content: string = "",
    embed: DiscordEmbed,
  ): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn("Discord webhook URL not configured")
      return false
    }

    try {
      const payload: DiscordWebhookPayload = {
        content: content,
        embeds: [embed],
      }

      const response = await fetch(this.webhookUrl, {
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
    user: { id: number; name: string; email: string },
    avatarUrl: string,
  ): Promise<void> {
    const embed: DiscordEmbed = {
      title: "🖼️ Avatar Upload",
      description: `User **${user.name}** has uploaded a new avatar`,
      color: 0x00ff00, // Green
      fields: [
        {
          name: "User ID",
          value: user.id.toString(),
          inline: true,
        },
        {
          name: "Email",
          value: user.email,
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

    await this.sendWebhook("<" + avatarUrl + ">", embed)
  }

  /**
   * Sends notification for Gravatar import
   */
  static async notifyGravatarImport(
    user: { id: number; name: string; email: string },
    avatarUrl: string,
  ): Promise<void> {
    const embed: DiscordEmbed = {
      title: "📥 Gravatar Import",
      description: `User **${user.name}** has imported their Gravatar`,
      color: 0x0099ff, // Blue
      fields: [
        {
          name: "User ID",
          value: user.id.toString(),
          inline: true,
        },
        {
          name: "Email",
          value: user.email,
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

    await this.sendWebhook("<" + avatarUrl + ">", embed)
  }

  /**
   * Sends notification for username change
   */
  static async notifyUsernameChange(
    user: { id: number; name: string; email: string },
    oldUsername: string,
    newUsername: string,
  ): Promise<void> {
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
          value: user.email,
          inline: true,
        },
        {
          name: "Old Username",
          value: oldUsername,
          inline: true,
        },
        {
          name: "New Username",
          value: newUsername,
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

    await this.sendWebhook("", embed)
  }
}
