CREATE TABLE `pfq_surveys` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `public_id` varchar(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `anonymous_responses` tinyint(1) NOT NULL DEFAULT 0,
  `allow_edits` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` int(10) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `public_id` (`public_id`),
  KEY `idx_pfq_surveys_start_date` (`start_date`),
  KEY `idx_pfq_surveys_end_date` (`end_date`),
  KEY `idx_pfq_surveys_created_by` (`created_by`),
  CONSTRAINT `pfq_surveys_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!80021 ALTER TABLE `pfq_surveys` ADD UNIQUE INDEX IF NOT EXISTS `public_id` (`public_id`) */;
/*!80021 ALTER TABLE `pfq_surveys` ADD INDEX IF NOT EXISTS `idx_pfq_surveys_start_date` (`start_date`) */;
/*!80021 ALTER TABLE `pfq_surveys` ADD INDEX IF NOT EXISTS `idx_pfq_surveys_end_date` (`end_date`) */;
/*!80021 ALTER TABLE `pfq_surveys` ADD INDEX IF NOT EXISTS `idx_pfq_surveys_created_by` (`created_by`) */;

