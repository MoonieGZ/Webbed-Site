CREATE TABLE `pfq_survey_question_groups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `survey_id` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `order_index` int(10) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pfq_survey_question_groups_survey_id` (`survey_id`),
  KEY `idx_pfq_survey_question_groups_order_index` (`order_index`),
  CONSTRAINT `pfq_survey_question_groups_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `pfq_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!80021 ALTER TABLE `pfq_survey_question_groups` ADD INDEX IF NOT EXISTS `idx_pfq_survey_question_groups_survey_id` (`survey_id`) */;
/*!80021 ALTER TABLE `pfq_survey_question_groups` ADD INDEX IF NOT EXISTS `idx_pfq_survey_question_groups_order_index` (`order_index`) */;

