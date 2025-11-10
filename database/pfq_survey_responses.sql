CREATE TABLE `pfq_survey_responses` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `survey_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `api_key_validated` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `survey_user` (`survey_id`, `user_id`),
  KEY `idx_pfq_survey_responses_survey_id` (`survey_id`),
  KEY `idx_pfq_survey_responses_user_id` (`user_id`),
  CONSTRAINT `pfq_survey_responses_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `pfq_surveys` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pfq_survey_responses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!80021 ALTER TABLE `pfq_survey_responses` ADD UNIQUE INDEX IF NOT EXISTS `survey_user` (`survey_id`, `user_id`) */;
/*!80021 ALTER TABLE `pfq_survey_responses` ADD INDEX IF NOT EXISTS `idx_pfq_survey_responses_survey_id` (`survey_id`) */;
/*!80021 ALTER TABLE `pfq_survey_responses` ADD INDEX IF NOT EXISTS `idx_pfq_survey_responses_user_id` (`user_id`) */;

