const fs = require('fs');

let code = fs.readFileSync('server/routes/entities-routes.js', 'utf8');

// 1. VIRTUAL DEALS logic injection
const virtualDealTarget = `      if (dealId > 1000000) {
        console.log('🏗️ Handling VIRTUAL DEAL update (Lead-based)');
        // Handle virtual deal update (update the lead instead)
        const leadId = dealId - 1000000;
        console.log('🆔 Target Lead ID:', leadId);`;

const virtualDealReplacement = `      if (dealId > 1000000) {
        console.log('🏗️ Handling VIRTUAL DEAL update (Lead-based)');
        const leadId = dealId - 1000000;
        console.log('🆔 Target Lead ID:', leadId);

        let isWon = false;
        if (body.pipeline === 'Won' || body.status === 'Won' || body.deal_stage === 'Won') {
          isWon = true;
        }

        if (isWon) {
          console.log('🏆 Virtual Deal marked as Won, converting to actual client & deal');
          const [leads] = await db.query('SELECT * FROM leads WHERE id = ?', [leadId]);
          if (leads.length === 0) return res.status(404).json({ error: 'Lead not found' });
          const lead = leads[0];

          // 1. Get or Create Company
          let companyId = lead.company_id || body.company_id;
          if (!companyId) {
            const [companyRes] = await db.query(
              'INSERT INTO companies (company_name, email, phone, industry, status, owner, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [lead.company || lead.lead_name || 'Unknown Company', lead.email, lead.phone, lead.industry, 'Active', lead.owner_id, lead.owner_id]
            );
            companyId = companyRes.insertId;
          }

          // 2. Get or Create Contact
          const [existingContacts] = await db.query('SELECT id FROM contacts WHERE company_id = ? LIMIT 1', [companyId]);
          let contactId = existingContacts.length > 0 ? existingContacts[0].id : null;
          if (!contactId) {
             const [contactRes] = await db.query(
               'INSERT INTO contacts (first_name, last_name, email, phone, company_id, owner_id) VALUES (?, ?, ?, ?, ?, ?)',
               [lead.referral_name || lead.lead_name || 'Contact', '', lead.email, lead.phone, companyId, lead.owner_id]
             );
             contactId = contactRes.insertId;
          }

          // 3. Create Real Deal
          const [dealRes] = await db.query(
            \`INSERT INTO deals (
              deal_name, description, deal_value, currency, status,
              company_id, contact_id, assignee_id, service_category_id, pipeline, deal_stage,
              probability, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())\`,
            [
              body.deal_name || lead.project_name || lead.lead_name || 'Converted Deal',
              body.description || lead.notes,
              body.deal_value || lead.value || 0,
              body.currency || lead.currency || 'USD',
              'Won',
              companyId,
              contactId,
              body.assignee_id || lead.owner_id,
              body.service_category_id || lead.service_category_id,
              'Won',
              'Won',
              100
            ]
          );
          const newDealId = dealRes.insertId;

          // 4. Update Lead
          await db.query(
            \`UPDATE leads SET lead_status = 'Won', converted_company_id = ?, converted_contact_id = ?, converted_deal_id = ?, updated_at = NOW() WHERE id = ?\`,
            [companyId, contactId, newDealId, leadId]
          );

          // 5. Fetch updated real deal and return it
          const [updatedDeal] = await db.query(\`
            SELECT d.*, c.company_name, ct.email AS contact_email, ct.phone AS contact_phone, 
                   ct.first_name AS contact_first_name, ct.last_name AS contact_last_name
            FROM deals d
            LEFT JOIN companies c ON d.company_id = c.id
            LEFT JOIN contacts ct ON d.contact_id = ct.id
            WHERE d.id = ?\`, [newDealId]);
          
          return res.json(updatedDeal[0]);
        }
`;

if (code.includes(virtualDealTarget)) {
    code = code.replace(virtualDealTarget, virtualDealReplacement);
    console.log('Injected Virtual Deal logic.');
} else {
    console.error('Virtual Deal target not found.');
}

// 2. NORMAL DEALS logic injection
const normalDealTarget = `      if (autoConversion) {
        const {
          deal_name,
          description,
          deal_value,
          currency,
          company_id,
          contact_id,
          assignee_id,
          service_category_id
        } = deal;`;

const normalDealReplacement = `      if (autoConversion) {
        let {
          deal_name,
          description,
          deal_value,
          currency,
          company_id,
          contact_id,
          assignee_id,
          service_category_id
        } = deal;

        // Ensure contact exists for the company so they appear in /api/contacts
        if (company_id && !contact_id) {
          const [existingContacts] = await db.query('SELECT id FROM contacts WHERE company_id = ? LIMIT 1', [company_id]);
          if (existingContacts.length === 0) {
            const [comp] = await db.query('SELECT company_name, email, phone FROM companies WHERE id = ?', [company_id]);
            if (comp.length > 0) {
              const [newContact] = await db.query(
                'INSERT INTO contacts (first_name, last_name, email, phone, company_id, owner_id) VALUES (?, ?, ?, ?, ?, ?)',
                [comp[0].company_name || 'Client', '', comp[0].email, comp[0].phone, company_id, assignee_id]
              );
              contact_id = newContact.insertId;
              await db.query('UPDATE deals SET contact_id = ? WHERE id = ?', [contact_id, id]);
            }
          } else {
            contact_id = existingContacts[0].id;
            await db.query('UPDATE deals SET contact_id = ? WHERE id = ?', [contact_id, id]);
          }
        }`;

if (code.includes(normalDealTarget)) {
    code = code.replace(normalDealTarget, normalDealReplacement);
    console.log('Injected Normal Deal logic.');
} else {
    console.error('Normal Deal target not found.');
}

fs.writeFileSync('server/routes/entities-routes.js', code);
console.log('Patch complete.');
