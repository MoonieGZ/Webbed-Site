-- Migration: Add PFQ username field to pfq_survey_responses
-- This stores the PFQ username retrieved from the API when the response is submitted

ALTER TABLE `pfq_survey_responses` 
ADD COLUMN `pfq_username` varchar(255) DEFAULT NULL 
AFTER `api_key_hash`;

-- Add index for faster lookups
ALTER TABLE `pfq_survey_responses` 
ADD INDEX `idx_pfq_survey_responses_pfq_username` (`pfq_username`);

