const BASE_URL = 'http://localhost:5000/api';

async function testDealsDisplay() {
  try {
    console.log('📋 Testing GET /api/deals...\n');

    const response = await fetch(`${BASE_URL}/deals`);
    const data = await response.json();

    if (Array.isArray(data)) {
      console.log(`✅ Found ${data.length} deals\n`);
      
      data.slice(0, 5).forEach(deal => {
        console.log(`Deal ID ${deal.id}:`);
        console.log(`  - Name: ${deal.deal_name}`);
        console.log(`  - Value: ${deal.deal_value} ${deal.currency}`);
        console.log(`  - Pipeline: ${deal.pipeline}`);
        console.log(`  - Stage: ${deal.deal_stage}`);
        console.log('');
      });

      const stageBreakdown = data.reduce((acc, deal) => {
        const stage = deal.pipeline || deal.deal_stage || 'Unclassified';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {});

      console.log('📊 Deals by Stage:');
      Object.entries(stageBreakdown).forEach(([stage, count]) => {
        console.log(`  - ${stage}: ${count} deals`);
      });
    } else {
      console.log('Response structure:', data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testDealsDisplay();
