CREATE TABLE `gi_character_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `profile_index` tinyint(3) unsigned NOT NULL CHECK (`profile_index` between 1 and 10),
  `name` varchar(64) DEFAULT NULL,
  `enabled_map` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`enabled_map`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `gi_character_profiles_user_idx` (`user_id`,`profile_index`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!80021 ALTER TABLE `gi_character_profiles` ADD UNIQUE INDEX IF NOT EXISTS `gi_character_profiles_user_idx` (`user_id`,`profile_index`) */;
