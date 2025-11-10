CREATE TABLE `pfq_survey_answers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `response_id` int(10) unsigned NOT NULL,
  `question_id` int(10) unsigned NOT NULL,
  `answer_value` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `response_question` (`response_id`, `question_id`),
  KEY `idx_pfq_survey_answers_response_id` (`response_id`),
  KEY `idx_pfq_survey_answers_question_id` (`question_id`),
  CONSTRAINT `pfq_survey_answers_ibfk_1` FOREIGN KEY (`response_id`) REFERENCES `pfq_survey_responses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pfq_survey_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `pfq_survey_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!80021 ALTER TABLE `pfq_survey_answers` ADD UNIQUE INDEX IF NOT EXISTS `response_question` (`response_id`, `question_id`) */;
/*!80021 ALTER TABLE `pfq_survey_answers` ADD INDEX IF NOT EXISTS `idx_pfq_survey_answers_response_id` (`response_id`) */;
/*!80021 ALTER TABLE `pfq_survey_answers` ADD INDEX IF NOT EXISTS `idx_pfq_survey_answers_question_id` (`question_id`) */;

