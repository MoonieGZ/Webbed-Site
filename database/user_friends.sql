CREATE TABLE `user_friends` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `requester_id` int(10) unsigned NOT NULL,
  `addressee_id` int(10) unsigned NOT NULL,
  `status` enum('pending','accepted','declined','blocked') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_friendship` (`requester_id`,`addressee_id`),
  KEY `addressee_id` (`addressee_id`),
  CONSTRAINT `user_friends_ibfk_1` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_friends_ibfk_2` FOREIGN KEY (`addressee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!80021 ALTER TABLE `user_friends` ADD UNIQUE INDEX IF NOT EXISTS `unique_friendship` (`requester_id`,`addressee_id`) */;
/*!80021 ALTER TABLE `user_friends` ADD INDEX IF NOT EXISTS `addressee_id` (`addressee_id`) */;
