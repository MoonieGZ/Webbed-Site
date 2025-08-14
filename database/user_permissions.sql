CREATE TABLE `user_permissions` (
  `user_id` int(10) unsigned NOT NULL,
  `can_change_user` tinyint(1) NOT NULL DEFAULT 1,
  `can_change_avatar` tinyint(1) NOT NULL DEFAULT 1,
  `is_banned` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!80021 ALTER TABLE `user_permissions` ADD UNIQUE INDEX IF NOT EXISTS `PRIMARY_user_id` (`user_id`) */;
