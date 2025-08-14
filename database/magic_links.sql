CREATE TABLE `magic_links` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `token` char(64) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_token` (`token`),
  KEY `fk_magic_user` (`user_id`),
  KEY `idx_magic_links_email_created` (`email`,`created_at`),
  KEY `idx_magic_links_ip_created` (`ip_address`,`created_at`),
  CONSTRAINT `fk_magic_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!80021 ALTER TABLE `magic_links` ADD UNIQUE INDEX IF NOT EXISTS `uniq_token` (`token`) */;
/*!80021 ALTER TABLE `magic_links` ADD INDEX IF NOT EXISTS `fk_magic_user` (`user_id`) */;
/*!80021 ALTER TABLE `magic_links` ADD INDEX IF NOT EXISTS `idx_magic_links_email_created` (`email`,`created_at`) */;
/*!80021 ALTER TABLE `magic_links` ADD INDEX IF NOT EXISTS `idx_magic_links_ip_created` (`ip_address`,`created_at`) */;
