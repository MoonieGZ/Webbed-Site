CREATE TABLE `pfq_survey_questions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `group_id` int(10) unsigned NOT NULL,
  `survey_id` int(10) unsigned NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('range_5','range_10','likert','text','choice') NOT NULL,
  `order_index` int(10) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pfq_survey_questions_group_id` (`group_id`),
  KEY `idx_pfq_survey_questions_survey_id` (`survey_id`),
  KEY `idx_pfq_survey_questions_order_index` (`order_index`),
  CONSTRAINT `pfq_survey_questions_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `pfq_survey_question_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pfq_survey_questions_ibfk_2` FOREIGN KEY (`survey_id`) REFERENCES `pfq_surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!80021 ALTER TABLE `pfq_survey_questions` ADD INDEX IF NOT EXISTS `idx_pfq_survey_questions_group_id` (`group_id`) */;
/*!80021 ALTER TABLE `pfq_survey_questions` ADD INDEX IF NOT EXISTS `idx_pfq_survey_questions_survey_id` (`survey_id`) */;
/*!80021 ALTER TABLE `pfq_survey_questions` ADD INDEX IF NOT EXISTS `idx_pfq_survey_questions_order_index` (`order_index`) */;

