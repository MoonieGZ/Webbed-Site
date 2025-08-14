CREATE TABLE `user_game_uids` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `game` enum('gi','hsr','zzz','ww') NOT NULL,
  `uid` varchar(32) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_game` (`user_id`,`game`),
  CONSTRAINT `user_game_uids_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!80021 ALTER TABLE `user_game_uids` ADD UNIQUE INDEX IF NOT EXISTS `unique_user_game` (`user_id`,`game`) */;
