ALTER TABLE `pfq_survey_questions` 
ADD COLUMN `is_optional` BOOLEAN NOT NULL DEFAULT FALSE AFTER `question_type`;

