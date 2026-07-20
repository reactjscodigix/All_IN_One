ALTER TABLE leads ADD COLUMN business_type VARCHAR(100) AFTER industry;
ALTER TABLE leads ADD COLUMN marketing_services JSON AFTER business_type;
ALTER TABLE leads ADD COLUMN it_services VARCHAR(255) AFTER marketing_services;
ALTER TABLE leads ADD COLUMN it_services_other VARCHAR(255) AFTER it_services;
