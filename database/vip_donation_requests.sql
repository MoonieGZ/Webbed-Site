CREATE TABLE `vip_donation_requests` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `donation_id` varchar(64) NOT NULL,
  `paypal_email` varchar(255) NOT NULL,
  `discord_username` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_donation_id` (`donation_id`),
  CONSTRAINT `fk_vip_donation_requests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!80021 ALTER TABLE `vip_donation_requests` ADD INDEX IF NOT EXISTS `idx_user_id` (`user_id`) */;
/*!80021 ALTER TABLE `vip_donation_requests` ADD INDEX IF NOT EXISTS `idx_donation_id` (`donation_id`) */;
