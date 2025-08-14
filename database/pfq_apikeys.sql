CREATE TABLE `pfq_apikeys` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `api_key` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_validated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_pfq_apikeys_user_id` (`user_id`),
  KEY `idx_pfq_apikeys_last_validated` (`last_validated`),
  CONSTRAINT `pfq_apikeys_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!80021 ALTER TABLE `pfq_apikeys` ADD UNIQUE INDEX IF NOT EXISTS `user_id` (`user_id`) */;
/*!80021 ALTER TABLE `pfq_apikeys` ADD INDEX IF NOT EXISTS `idx_pfq_apikeys_user_id` (`user_id`) */;
/*!80021 ALTER TABLE `pfq_apikeys` ADD INDEX IF NOT EXISTS `idx_pfq_apikeys_last_validated` (`last_validated`) */;
