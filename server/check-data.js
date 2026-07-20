const pool = require('./config/database');

(async () => {
  try {
    const conn = await pool.getConnection();
    
    console.log('=== INVOICES (All) ===');
    const [invoices] = await conn.query('SELECT id, invoice_number, client_id, amount FROM invoices');
    invoices.forEach(inv => console.log(`ID: ${inv.id}, Number: ${inv.invoice_number}, Client ID: ${inv.client_id}, Amount: ${inv.amount}`));
    
    console.log('\n=== INVOICE #15 DETAILS ===');
    const [inv15] = await conn.query('SELECT i.*, c.company_name FROM invoices i LEFT JOIN companies c ON i.client_id = c.id WHERE i.id = 15');
    if (inv15.length) {
      console.log(inv15[0]);
    } else {
      console.log('Invoice 15 NOT FOUND');
    }
    
    console.log('\n=== INVOICE ITEMS COUNT ===');
    const [itemCount] = await conn.query('SELECT COUNT(*) as count FROM invoice_items');
    console.log('Total Items:', itemCount[0].count);
    
    console.log('\n=== ITEMS PER INVOICE ===');
    const [itemsByInvoice] = await conn.query('SELECT invoice_id, COUNT(*) as item_count FROM invoice_items GROUP BY invoice_id');
    itemsByInvoice.forEach(row => console.log(`Invoice ${row.invoice_id}: ${row.item_count} items`));
    
    console.log('\n=== ITEMS FOR INVOICE 15 ===');
    const [items15] = await conn.query('SELECT * FROM invoice_items WHERE invoice_id = 15');
    if (items15.length) {
      items15.forEach(item => console.log(item));
    } else {
      console.log('No items found for invoice 15');
    }
    
    console.log('\n=== COMPANIES (First 15) ===');
    const [companies] = await conn.query('SELECT id, company_name FROM companies LIMIT 15');
    companies.forEach(c => console.log(`ID: ${c.id}, Name: ${c.company_name}`));
    
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
