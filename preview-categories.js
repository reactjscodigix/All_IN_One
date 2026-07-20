const fs = require('fs');
const path = require('path');

const compDir = 'client/src/components';
const files = fs.readdirSync(compDir).filter(f => f.endsWith('.js') || f.endsWith('.jsx'));

const categories = {
  it: ['IT'],
  'seo-gmb': ['SeoGmb'],
  marketing: ['Marketing', 'Campaign', 'Blog', 'AllBlogs'],
  'super-admin': ['SuperAdmin', 'Packages', 'Domain', 'PurchaseTransaction', 'Subscriptions', 'CompanyPlans', 'Membership'],
  sales: ['Sales', 'Deal', 'Lead', 'Quotation', 'Commission', 'Approvals', 'ConvertLead', 'Performance', 'Target', 'Pipeline', 'RevenueForecast', 'LostDeals', 'WonDeals'],
};

const fileMap = {};

files.forEach(file => {
  let folder = 'common';
  for (let cat in categories) {
    if (categories[cat].some(prefix => file.startsWith(prefix) || file.includes(prefix))) {
      folder = cat;
      break;
    }
  }
  
  // Specific overrides
  if (file.startsWith('IT')) folder = 'it'; // Strict prefix for IT
  if (file.includes('CrmDeals') || file.includes('CrmLeads')) folder = 'sales';
  if (file.includes('CrmCompanies') || file.includes('CrmCampaign')) folder = 'common';
  
  if (!fileMap[folder]) fileMap[folder] = [];
  fileMap[folder].push(file);
});

console.log(JSON.stringify(fileMap, null, 2));
