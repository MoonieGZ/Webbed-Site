import { readdir, stat, unlink } from "fs/promises"
import { join } from "path"

export interface RecentAvatar {
  src: string
  filename: string
  modifiedTime: Date
}

export async function getRecentAvatars(
  userId: number,
  limit: number = 10,
): Promise<RecentAvatar[]> {
  try {
    const userAvatarDir = join(
      process.cwd(),
      "public",
      "avatars",
      userId.toString(),
    )

    try {
      await stat(userAvatarDir)
    } catch {
      return []
    }

    const files = await readdir(userAvatarDir)
    const avatarFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
    )

    const avatarsWithStats = await Promise.all(
      avatarFiles.map(async (filename) => {
        const filePath = join(userAvatarDir, filename)
        const stats = await stat(filePath)
        return {
          src: `/avatars/${userId}/${filename}`,
          filename,
          modifiedTime: stats.mtime,
        }
      }),
    )

    return avatarsWithStats
      .sort((a, b) => b.modifiedTime.getTime() - a.modifiedTime.getTime())
      .slice(0, limit)
  } catch (error) {
    console.error("Error getting recent avatars:", error)
    return []
  }
}

export async function cleanupOldAvatars(
  userId: number,
  keepCount: number = 5,
): Promise<void> {
  try {
    const userAvatarDir = join(
      process.cwd(),
      "public",
      "avatars",
      userId.toString(),
    )

    try {
      await stat(userAvatarDir)
    } catch {
      return
    }

    const files = await readdir(userAvatarDir)
    const avatarFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
    )

    if (avatarFiles.length <= keepCount) {
      return
    }

    const avatarsWithStats = await Promise.all(
      avatarFiles.map(async (filename) => {
        const filePath = join(userAvatarDir, filename)
        const stats = await stat(filePath)
        return {
          filename,
          filePath,
          modifiedTime: stats.mtime,
        }
      }),
    )

    const sortedAvatars = avatarsWithStats.sort(
      (a, b) => a.modifiedTime.getTime() - b.modifiedTime.getTime(),
    )

    const filesToDelete = sortedAvatars.slice(
      0,
      sortedAvatars.length - keepCount,
    )

    await Promise.all(
      filesToDelete.map(async ({ filePath }) => {
        try {
          await unlink(filePath)
        } catch (error) {
          console.error(`Error deleting avatar file ${filePath}:`, error)
        }
      }),
    )
  } catch (error) {
    console.error("Error cleaning up old avatars:", error)
  }
}

export async function detectImageMime(buffer: Buffer): Promise<string | null> {
  if (buffer.length > 12) {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
      return "image/jpeg"
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    )
      return "image/png"
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46)
      return "image/gif"
    if (
      buffer.slice(0, 4).toString("ascii") === "RIFF" &&
      buffer.slice(8, 12).toString("ascii") === "WEBP"
    )
      return "image/webp"
  }
  return null
}
