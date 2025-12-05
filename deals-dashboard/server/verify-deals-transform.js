const sampleDealResponse = {
  "id": 8,
  "deal_name": "seo deal",
  "company_id": null,
  "contact_id": 1,
  "stage": "",
  "deal_value": "1.00",
  "status": "Won",
  "company_name": null,
  "first_name": "John",
  "last_name": "Smith",
  "assignee_first_name": "John",
  "assignee_last_name": "Smith"
};

const transformedDeal = {
  id: sampleDealResponse.id,
  name: sampleDealResponse.deal_name,
  company: sampleDealResponse.company_name || 'Unknown',
  contact: sampleDealResponse.contact_id ? `${sampleDealResponse.first_name || ''} ${sampleDealResponse.last_name || ''}`.trim() : 'N/A',
  stage: sampleDealResponse.deal_stage || sampleDealResponse.pipeline || 'N/A',
  value: parseFloat(sampleDealResponse.deal_value) || 0,
  status: sampleDealResponse.status || 'Pending',
  deal_name: sampleDealResponse.deal_name,
  company_id: sampleDealResponse.company_id,
  contact_id: sampleDealResponse.contact_id,
  ...sampleDealResponse
};

console.log('Original Deal:', JSON.stringify(sampleDealResponse, null, 2));
console.log('\n\nTransformed Deal:', JSON.stringify(transformedDeal, null, 2));
console.log('\n\nKey fields for table:');
console.log('- name:', transformedDeal.name);
console.log('- company:', transformedDeal.company);
console.log('- contact:', transformedDeal.contact);
console.log('- stage:', transformedDeal.stage);
console.log('- value:', transformedDeal.value);
console.log('- status:', transformedDeal.status);
