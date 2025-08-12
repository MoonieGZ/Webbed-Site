export const ADMIN_USER_ID = 1 as const

// TODO: add admin role to database

export type UserPermissions = {
  can_change_user: 0 | 1
  can_change_avatar: 0 | 1
  is_banned: 0 | 1
}

export const defaultPermissions: UserPermissions = {
  can_change_user: 1,
  can_change_avatar: 1,
  is_banned: 0,
}
