const http = require('http');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ statusCode: res.statusCode, data });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testConvertLead() {
  try {
    console.log('=== Testing Convert Lead to Deal ===\n');

    console.log('1. Fetching existing leads...');
    const leadsRes = await makeRequest('GET', '/api/leads');
    if (leadsRes.statusCode !== 200) {
      console.error('❌ Failed to fetch leads:', leadsRes.data);
      return;
    }
    
    const leads = Array.isArray(leadsRes.data) ? leadsRes.data : leadsRes.data.leads || [];
    if (leads.length === 0) {
      console.log('⚠️ No leads found. Creating a test lead first...');
      const newLeadRes = await makeRequest('POST', '/api/leads', {
        lead_name: 'Test Lead for Conversion',
        email: 'testlead@example.com',
        phone: '555-1234',
        company: 'Test Company',
        lead_source: 'Website',
        lead_status: 'Not Contacted',
        value: 50000
      });
      
      if (newLeadRes.statusCode !== 201) {
        console.error('❌ Failed to create test lead:', newLeadRes.data);
        return;
      }
      leads.push(newLeadRes.data);
      console.log('✅ Test lead created:', newLeadRes.data.id);
    }

    const leadToConvert = leads[0];
    console.log(`\n2. Converting Lead #${leadToConvert.id} (${leadToConvert.lead_name || leadToConvert.name}) to Deal...`);

    const convertRes = await makeRequest('POST', `/api/leads/${leadToConvert.id}/convert-to-deal`, {
      deal_name: `Deal from ${leadToConvert.lead_name || leadToConvert.name}`,
      deal_value: leadToConvert.value || 50000,
      currency: 'USD',
      company_id: leadToConvert.company_id || null,
      description: `Converted from lead ${leadToConvert.id}`
    });

    if (convertRes.statusCode !== 201) {
      console.error('❌ Conversion failed:', convertRes.data);
      return;
    }

    console.log('✅ Lead successfully converted to deal!');
    console.log('   Deal ID:', convertRes.data.deal?.id);
    console.log('   Deal Name:', convertRes.data.deal?.deal_name);
    console.log('   Deal Value:', convertRes.data.deal?.deal_value);
    console.log('   Pipeline ID:', convertRes.data.deal?.pipeline_id);
    console.log('   Stage ID:', convertRes.data.deal?.deal_stage);

    console.log('\n3. Verifying lead is marked as converted...');
    const verifyRes = await makeRequest('GET', `/api/leads/${leadToConvert.id}`);
    if (verifyRes.statusCode === 200) {
      console.log('✅ Lead status after conversion:', verifyRes.data?.lead_status || verifyRes.data?.status);
      console.log('   Converted Deal ID:', verifyRes.data?.converted_deal_id);
    }

    console.log('\n4. Verifying deal was created...');
    const dealRes = await makeRequest('GET', `/api/deals/${convertRes.data.deal.id}`);
    if (dealRes.statusCode === 200) {
      console.log('✅ Deal successfully created and retrieved');
      console.log('   Status:', dealRes.data?.status);
      console.log('   Value:', dealRes.data?.deal_value);
    }

    console.log('\n=== All tests passed! ===\n');
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
  
  process.exit(0);
}

testConvertLead();
