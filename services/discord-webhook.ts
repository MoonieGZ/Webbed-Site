import type { DiscordEmbed, DiscordWebhookPayload } from "@/types/discord"

export class DiscordWebhookService {
  private static readonly userinfoWebhookUrl = process.env.DISCORD_USERINFO
  private static readonly donationWebhookUrl = process.env.DISCORD_DONATION

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

    await this.sendWebhook("<" + avatarUrl + ">", embed, "userinfo")
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

    await this.sendWebhook("<" + avatarUrl + ">", embed, "userinfo")
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

    await this.sendWebhook("", embed, "userinfo")
  }

  static async notifyDonationRequest(
    user: { id: number; name: string; email: string },
    donationId: string,
    paypalEmail: string,
    discordUsername: string,
  ): Promise<void> {
    const embed: DiscordEmbed = {
      title: "💰 Donation Validation Request",
      description: `User **${user.name}** has requested a donation validation`,
      color: 0xffd700, // Gold
      fields: [
        {
          name: "User ID",
          value: user.id.toString(),
          inline: true,
        },
        {
          name: "Donation ID",
          value: donationId,
          inline: true,
        },
        {
          name: "PayPal Email",
          value: paypalEmail,
          inline: true,
        },
        {
          name: "Discord Username",
          value: discordUsername,
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
