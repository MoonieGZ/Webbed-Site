CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `avatar` varchar(255) DEFAULT NULL,
  `title` varchar(32) DEFAULT NULL,
  `name_changed_at` timestamp NULL DEFAULT NULL,
  `discord_id` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `discord_id` (`discord_id`),
  KEY `idx_users_name_changed_at` (`name_changed_at`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

/*!80021 ALTER TABLE `users` ADD INDEX IF NOT EXISTS `idx_users_name_changed_at` (`name_changed_at`) */;
