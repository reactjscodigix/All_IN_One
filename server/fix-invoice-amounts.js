const pool = require('./config/database');

async function fixInvoiceAmounts() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('🔧 Checking invoices with NULL/0 amounts...');
    
    const [invoicesToFix] = await connection.query(`
      SELECT i.*, e.amount as est_amount, e.expiry_date 
      FROM invoices i
      LEFT JOIN estimations e ON i.client_id = e.client_id
      WHERE i.amount IS NULL OR i.amount = 0 OR i.total IS NULL OR i.total = 0
      LIMIT 10
    `);

    console.log(`📋 Found ${invoicesToFix.length} invoices needing fixes`);
    
    if (invoicesToFix.length > 0) {
      console.log('Sample invoices to fix:');
      invoicesToFix.forEach(inv => {
        console.log(`  - #${inv.invoice_number}: amount=${inv.amount}, total=${inv.total}, open_till=${inv.open_till}`);
      });
    }

    const [result] = await connection.query(`
      UPDATE invoices 
      SET 
        amount = COALESCE(amount, 0),
        total = COALESCE(total, amount, 0),
        open_till = COALESCE(open_till, DATE_ADD(NOW(), INTERVAL 30 DAY))
      WHERE amount IS NULL OR amount = 0 OR total IS NULL OR total = 0
    `);

    console.log(`✅ Updated ${result.affectedRows} invoices`);

    const [updatedInvoices] = await connection.query(`
      SELECT invoice_number, amount, total, open_till 
      FROM invoices 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('\n📊 Sample of updated invoices:');
    updatedInvoices.forEach(inv => {
      console.log(`  - #${inv.invoice_number}: amount=$${inv.amount}, total=$${inv.total}, due=${inv.open_till}`);
    });

    connection.release();
    console.log('\n✅ Fix complete!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

fixInvoiceAmounts();
