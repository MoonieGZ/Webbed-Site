ALTER TABLE `pfq_survey_questions` 
MODIFY COLUMN `question_type` enum('range_5','range_10','likert','text','choice','number') NOT NULL;

