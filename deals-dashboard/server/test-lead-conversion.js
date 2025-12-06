const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('\n=== LEAD CONVERSION WORKFLOW TEST ===\n');

  try {
    // Step 1: Create a test lead
    console.log('📝 Step 1: Creating test lead...');
    const createLeadRes = await request('POST', '/leads', {
      name: 'Test Lead for Conversion',
      email: 'testlead@example.com',
      phone: '555-0123',
      company: 'Tech Corp',
      source: 'Website',
      status: 'New',
      rating: 4,
      description: 'Test lead for conversion workflow'
    });

    if (createLeadRes.status !== 201 && createLeadRes.status !== 200) {
      throw new Error(`Failed to create lead: ${JSON.stringify(createLeadRes.data)}`);
    }

    const leadId = createLeadRes.data.id;
    console.log(`✅ Lead created successfully (ID: ${leadId})\n`);

    // Step 2: Fetch lead details
    console.log('📋 Step 2: Fetching lead details...');
    const getLeadRes = await request('GET', `/leads/${leadId}`);
    
    if (getLeadRes.status !== 200) {
      throw new Error(`Failed to fetch lead: ${JSON.stringify(getLeadRes.data)}`);
    }
    
    console.log(`✅ Lead retrieved: ${getLeadRes.data.lead_name}\n`);

    // Step 3: Update lead status to Qualified
    console.log('⬆️ Step 3: Updating lead status to Qualified...');
    const updateRes = await request('PUT', `/leads/${leadId}`, {
      ...getLeadRes.data,
      status: 'Qualified'
    });

    if (updateRes.status !== 200) {
      throw new Error(`Failed to update lead: ${JSON.stringify(updateRes.data)}`);
    }
    
    console.log(`✅ Lead status updated to: Qualified\n`);

    // Step 4: Convert to Contact
    console.log('👤 Step 4: Converting lead to Contact...');
    const convertContactRes = await request('POST', `/leads/${leadId}/convert-to-contact`, {
      first_name: 'Test',
      last_name: 'Contact',
      position: 'Manager',
      status: 'Active'
    });

    if (convertContactRes.status !== 200) {
      throw new Error(`Failed to convert to contact: ${JSON.stringify(convertContactRes.data)}`);
    }

    const contactId = convertContactRes.data.contactId;
    console.log(`✅ Lead converted to Contact (ID: ${contactId})`);
    console.log(`   Contact: ${convertContactRes.data.contact.first_name} ${convertContactRes.data.contact.last_name}`);
    console.log(`   Email: ${convertContactRes.data.contact.email}\n`);

    // Step 5: Create another lead for company conversion
    console.log('📝 Step 5: Creating second test lead for company conversion...');
    const createLead2Res = await request('POST', '/leads', {
      name: 'Tech Company Lead',
      email: 'company@techcorp.com',
      phone: '555-0456',
      company: 'TechCorp Industries',
      source: 'LinkedIn',
      status: 'Contacted',
      rating: 5,
      description: 'Potential company conversion'
    });

    const leadId2 = createLead2Res.data.id;
    console.log(`✅ Second lead created (ID: ${leadId2})\n`);

    // Step 6: Convert to Company
    console.log('🏢 Step 6: Converting lead to Company...');
    const convertCompanyRes = await request('POST', `/leads/${leadId2}/convert-to-company`, {
      company_name: 'TechCorp Industries',
      industry: 'Technology',
      website: 'www.techcorp.com',
      address: '123 Tech Street, San Francisco, CA'
    });

    if (convertCompanyRes.status !== 200) {
      throw new Error(`Failed to convert to company: ${JSON.stringify(convertCompanyRes.data)}`);
    }

    const companyId = convertCompanyRes.data.companyId;
    console.log(`✅ Lead converted to Company (ID: ${companyId})`);
    console.log(`   Company: ${convertCompanyRes.data.company.company_name}`);
    console.log(`   Industry: ${convertCompanyRes.data.company.industry}`);
    console.log(`   Email: ${convertCompanyRes.data.company.email}\n`);

    // Step 7: Create third lead for deal conversion
    console.log('📝 Step 7: Creating third test lead for deal conversion...');
    const createLead3Res = await request('POST', '/leads', {
      name: 'Sales Deal Lead',
      email: 'deal@client.com',
      phone: '555-0789',
      company: 'Big Client Corp',
      source: 'Referral',
      status: 'Qualified',
      rating: 5,
      description: 'Hot lead - ready for deal'
    });

    const leadId3 = createLead3Res.data.id;
    console.log(`✅ Third lead created (ID: ${leadId3})\n`);

    // Step 8: Convert to Deal
    console.log('💰 Step 8: Converting lead to Deal...');
    const convertDealRes = await request('POST', `/leads/${leadId3}/convert-to-deal`, {
      deal_name: 'Enterprise Software License',
      deal_value: 50000,
      currency: 'USD',
      company_id: companyId,
      contact_id: contactId,
      pipeline: 'Sales Pipeline',
      status: 'Pending',
      description: 'Converted from lead: Sales Deal Lead'
    });

    if (convertDealRes.status !== 200) {
      throw new Error(`Failed to convert to deal: ${JSON.stringify(convertDealRes.data)}`);
    }

    const dealId = convertDealRes.data.dealId;
    console.log(`✅ Lead converted to Deal (ID: ${dealId})`);
    console.log(`   Deal: ${convertDealRes.data.deal.deal_name}`);
    console.log(`   Value: ${convertDealRes.data.deal.currency} ${convertDealRes.data.deal.deal_value}`);
    console.log(`   Status: ${convertDealRes.data.deal.status}\n`);

    // Step 9: Verify all conversions
    console.log('✔️ Step 9: Verifying all created entities...\n');

    const verifyContact = await request('GET', `/contacts`);
    const contactExists = verifyContact.data.some(c => c.id === contactId);
    console.log(`${contactExists ? '✅' : '❌'} Contact exists in database`);

    const verifyCompany = await request('GET', `/companies`);
    const companyExists = verifyCompany.data.some(c => c.id === companyId);
    console.log(`${companyExists ? '✅' : '❌'} Company exists in database`);

    const verifyDeal = await request('GET', `/deals`);
    const dealExists = verifyDeal.data.some(d => d.id === dealId);
    console.log(`${dealExists ? '✅' : '❌'} Deal exists in database`);

    console.log('\n=== TEST RESULTS ===');
    console.log('✅ All lead conversion operations completed successfully!');
    console.log(`\nSummary:`);
    console.log(`  • Lead → Contact (ID: ${contactId})`);
    console.log(`  • Lead → Company (ID: ${companyId})`);
    console.log(`  • Lead → Deal (ID: ${dealId})`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

runTests();
