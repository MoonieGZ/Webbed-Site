CREATE TABLE `gi_boss_profiles` (
  `user_id` int(11) NOT NULL,
  `profile_index` tinyint(4) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `enabled_map` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`enabled_map`)),
  PRIMARY KEY (`user_id`,`profile_index`),
  KEY `idx_gi_boss_profiles_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!80021 ALTER TABLE `gi_boss_profiles` ADD INDEX IF NOT EXISTS `idx_gi_boss_profiles_user` (`user_id`) */;
