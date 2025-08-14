CREATE TABLE `user_featured_badges` (
  `user_id` int(10) unsigned NOT NULL,
  `badge_id` int(10) unsigned NOT NULL,
  `slot` tinyint(3) unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`slot`),
  KEY `badge_id` (`badge_id`),
  CONSTRAINT `user_featured_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_featured_badges_ibfk_2` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!80021 ALTER TABLE `user_featured_badges` ADD INDEX IF NOT EXISTS `badge_id` (`badge_id`) */;
