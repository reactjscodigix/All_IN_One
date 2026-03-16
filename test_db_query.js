
const pool = require('./deals-dashboard/server/config/database');

async function testDealsQuery() {
    try {
        console.log('Testing Deals Query...');
        const query = `
        (SELECT 
          d.id, d.deal_name, d.description, d.deal_value, d.currency, d.status, d.company_id, d.contact_id, 
          d.assignee_id, d.service_category_id, d.pipeline, d.deal_stage, d.probability, d.expected_close_date, 
          d.created_at, d.updated_at, c.company_name, ct.email AS contact_email, ct.phone AS contact_phone, 
          ct.first_name AS contact_first_name, ct.last_name AS contact_last_name, u.first_name AS assignee_first_name, 
          u.last_name AS assignee_last_name, sc.name AS service_name, l.id AS lead_id, l.project_name, 
          l.business_type, l.marketing_services, l.it_services, l.it_services_other, l.referral_name, 'Deal' as record_type
        FROM deals d 
        LEFT JOIN companies c ON d.company_id = c.id 
        LEFT JOIN contacts ct ON d.contact_id = ct.id 
        LEFT JOIN users u ON d.assignee_id = u.id 
        LEFT JOIN service_categories sc ON d.service_category_id = sc.id
        LEFT JOIN leads l ON l.converted_deal_id = d.id
        LIMIT 1
        )
        UNION ALL
        (SELECT 
          l.id + 1000000 as id, l.lead_name as deal_name, l.notes as description, l.value as deal_value, 
          l.currency, l.lead_status as status, l.company_id, null as contact_id, l.owner_id as assignee_id, 
          l.service_category_id, l.lead_status as pipeline, l.lead_status as deal_stage, 10 as probability, 
          null as expected_close_date, l.created_at, l.updated_at, COALESCE(c.company_name, l.company) as company_name, 
          l.email AS contact_email, l.phone AS contact_phone, null AS contact_first_name, null AS contact_last_name, 
          u.first_name AS assignee_first_name, u.last_name AS assignee_last_name, sc.name AS service_name, 
          l.id AS lead_id, l.project_name, l.business_type, l.marketing_services, l.it_services, 
          l.it_services_other, l.referral_name, 'Converted Lead' as record_type
        FROM leads l
        LEFT JOIN companies c ON l.company_id = c.id
        LEFT JOIN users u ON l.owner_id = u.id
        LEFT JOIN service_categories sc ON l.service_category_id = sc.id
        LIMIT 1
        )`;
        
        const [rows] = await pool.query(query);
        console.log('✓ Query successful! Rows found:', rows.length);
        process.exit(0);
    } catch (err) {
        console.error('❌ Query failed:', err.message);
        process.exit(1);
    }
}

testDealsQuery();
