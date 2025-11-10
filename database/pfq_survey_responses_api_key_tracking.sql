-- Migration: Add API key hash tracking to pfq_survey_responses
-- This allows tracking responses by API key for unauthenticated users to prevent duplicate submissions

ALTER TABLE `pfq_survey_responses` 
ADD COLUMN `api_key_hash` varchar(64) DEFAULT NULL 
AFTER `api_key_validated`;

-- Add unique constraint to prevent duplicate responses from the same API key
-- Note: This allows one response per API key per survey
ALTER TABLE `pfq_survey_responses` 
ADD UNIQUE KEY `survey_api_key` (`survey_id`, `api_key_hash`);

-- Add index for faster lookups
ALTER TABLE `pfq_survey_responses` 
ADD INDEX `idx_pfq_survey_responses_api_key_hash` (`api_key_hash`);

