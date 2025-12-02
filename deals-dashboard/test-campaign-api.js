const http = require('http');

function testAPI(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
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

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing Campaign API...\n');

  try {
    console.log('1. GET /api/campaigns - Fetch all campaigns');
    const campaigns = await testAPI('GET', '/campaigns');
    console.log(`Status: ${campaigns.status}`);
    console.log(`Count: ${Array.isArray(campaigns.data) ? campaigns.data.length : 0}`);
    console.log('');

    console.log('2. POST /api/campaigns - Create new campaign');
    const newCampaign = await testAPI('POST', '/campaigns', {
      name: 'Summer Sales Campaign',
      campaign_type: 'Email Marketing',
      deal_value: 50000,
      currency: 'USD',
      period: 'Monthly',
      period_value: '3 months',
      target_audience: ['Small Business', 'Corporate Companies', 'Urban Apartment'],
      description: 'Test campaign for summer products with email marketing focus',
      status: 'Draft'
    });
    console.log(`Status: ${newCampaign.status}`);
    console.log(`Response:`, JSON.stringify(newCampaign.data, null, 2));

    if (newCampaign.data.id) {
      console.log('\n3. GET /api/campaigns/:id - Fetch specific campaign');
      const campaignId = newCampaign.data.id;
      const singleCampaign = await testAPI('GET', `/campaigns/${campaignId}`);
      console.log(`Status: ${singleCampaign.status}`);
      console.log(`Campaign:`, JSON.stringify(singleCampaign.data, null, 2));

      console.log('\n4. PUT /api/campaigns/:id - Update campaign');
      const updateResult = await testAPI('PUT', `/campaigns/${campaignId}`, {
        name: 'Updated Summer Sales Campaign',
        campaign_type: 'Social Media',
        deal_value: 75000,
        currency: 'USD',
        period: 'Quarterly',
        period_value: '1 quarter',
        target_audience: ['Tech Companies', 'Startups'],
        description: 'Updated campaign description with social media focus',
        status: 'Draft'
      });
      console.log(`Status: ${updateResult.status}`);
      console.log(`Response:`, JSON.stringify(updateResult.data, null, 2));

      console.log('\n5. DELETE /api/campaigns/:id - Delete campaign');
      const deleteResult = await testAPI('DELETE', `/campaigns/${campaignId}`);
      console.log(`Status: ${deleteResult.status}`);
      console.log(`Response:`, JSON.stringify(deleteResult.data, null, 2));
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }

  process.exit(0);
}

setTimeout(runTests, 2000);
