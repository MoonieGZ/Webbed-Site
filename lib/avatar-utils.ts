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
  keepCount: number = 10,
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
