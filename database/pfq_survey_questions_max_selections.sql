ALTER TABLE `pfq_survey_questions` 
ADD COLUMN `max_selections` int(10) unsigned NULL DEFAULT NULL AFTER `allow_multiple`;

