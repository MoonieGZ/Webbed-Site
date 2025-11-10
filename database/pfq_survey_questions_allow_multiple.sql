-- Migration: Add allow_multiple field to pfq_survey_questions for choice questions
-- This allows choice questions to support either single selection (radio) or multiple selections (checkboxes)

ALTER TABLE `pfq_survey_questions` 
ADD COLUMN `allow_multiple` tinyint(1) NOT NULL DEFAULT 0 
AFTER `question_type`;

-- Update existing choice questions to default to single selection (radio)
UPDATE `pfq_survey_questions` 
SET `allow_multiple` = 0 
WHERE `question_type` = 'choice';

