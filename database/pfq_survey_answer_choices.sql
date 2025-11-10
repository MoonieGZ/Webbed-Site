CREATE TABLE `pfq_survey_answer_choices` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `question_id` int(10) unsigned NOT NULL,
  `choice_text` varchar(255) NOT NULL,
  `order_index` int(10) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pfq_survey_answer_choices_question_id` (`question_id`),
  KEY `idx_pfq_survey_answer_choices_order_index` (`order_index`),
  CONSTRAINT `pfq_survey_answer_choices_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `pfq_survey_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!80021 ALTER TABLE `pfq_survey_answer_choices` ADD INDEX IF NOT EXISTS `idx_pfq_survey_answer_choices_question_id` (`question_id`) */;
/*!80021 ALTER TABLE `pfq_survey_answer_choices` ADD INDEX IF NOT EXISTS `idx_pfq_survey_answer_choices_order_index` (`order_index`) */;

