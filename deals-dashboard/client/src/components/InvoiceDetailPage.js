import React, { useState, useEffect } from 'react';
import { Download, Printer } from 'lucide-react';
import { invoicesAPI } from '../services/api';

const InvoiceDetailPage = ({ invoiceId, onClose }) => {
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setIsLoading(true);
      const [invoiceData, itemsData] = await Promise.all([
        invoicesAPI.getById(invoiceId),
        invoicesAPI.getItems(invoiceId).catch(() => [])
      ]);
      setInvoice(invoiceData);
      setItems(itemsData && Array.isArray(itemsData) ? itemsData : []);
    } catch (err) {
      setError('Failed to load invoice');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toFixed(2)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yPosition = margin;

    doc.setFontSize(24);
    doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoice_number}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Due Date: ${new Date(invoice.open_till).toLocaleDateString()}`, margin, yPosition);
    yPosition += 10;

    if (invoice.companyDetails) {
      doc.setFontSize(9);
      doc.text('FROM:', margin, yPosition);
      yPosition += 4;
      doc.setFontSize(8);
      const companyLines = invoice.companyDetails.split('\n');
      companyLines.forEach(line => {
        doc.text(line, margin + 2, yPosition);
        yPosition += 3;
      });
      yPosition += 5;
    }

    doc.setFontSize(9);
    doc.text('TO:', margin, yPosition);
    yPosition += 4;
    doc.setFontSize(8);
    doc.text(invoice.bill_to, margin + 2, yPosition);
    yPosition += 3;
    if (invoice.ship_to) {
      doc.text(`Ship To: ${invoice.ship_to}`, margin + 2, yPosition);
      yPosition += 3;
    }
    yPosition += 5;

    const tableData = [];
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach(item => {
        tableData.push([
          item.item_name,
          item.quantity.toString(),
          formatCurrency(item.rate),
          `${item.discount_percentage}%`,
          `${item.tax_percentage}%`,
          formatCurrency((item.quantity * item.rate) * (1 - (item.discount_percentage / 100)) * (1 + (item.tax_percentage / 100)))
        ]);
      });
    }

    doc.autoTable({
      head: [['Item', 'Qty', 'Rate', 'Discount', 'Tax', 'Total']],
      body: tableData,
      startY: yPosition,
      margin: margin,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    yPosition = doc.internal.pageSize.getHeight() - 50;
    doc.setFontSize(10);
    doc.text('Summary:', margin, yPosition);
    yPosition += 5;
    doc.setFontSize(9);
    doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, margin + 10, yPosition);
    yPosition += 4;
    if (invoice.discount_amount > 0) {
      doc.text(`Discount: -${formatCurrency(invoice.discount_amount)}`, margin + 10, yPosition);
      yPosition += 4;
    }
    if (invoice.tax_amount > 0) {
      doc.text(`Tax: +${formatCurrency(invoice.tax_amount)}`, margin + 10, yPosition);
      yPosition += 4;
    }
    doc.setFontSize(10);
    doc.text(`Total: ${formatCurrency(invoice.total)}`, margin + 10, yPosition);

    doc.save(`Invoice-${invoice.invoice_number}.pdf`);
  };



  const numberToWords = (num) => {
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const scales = ['', 'thousand', 'million', 'billion'];

    if (num === 0) return 'Zero';
    let n = parseInt(num);
    let result = '';
    let scaleIndex = 0;

    while (n > 0) {
      const remainder = n % 1000;
      if (remainder !== 0) {
        const part = [];
        const hundreds = Math.floor(remainder / 100);
        const rest = remainder % 100;
        const ten = Math.floor(rest / 10);
        const one = rest % 10;

        if (hundreds > 0) part.push(words[hundreds] + ' hundred');
        if (ten > 1) part.push(tens[ten] + (one > 0 ? ' ' + words[one] : ''));
        else if (rest > 0) part.push(words[rest]);

        result = part.join(' ') + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + (result ? ' ' + result : '');
      }
      n = Math.floor(n / 1000);
      scaleIndex++;
    }

    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <p className="text-red-600 mb-4">{error || 'Invoice not found'}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const daysUntilDue = Math.ceil((new Date(invoice.open_till) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/20 print:bg-white print:p-0">
      <div className="min-h-screen flex items-start justify-center py-8 px-4 print:p-0 print:bg-white print:py-0">
        <div className="w-full max-w-5xl bg-white rounded-md shadow-sm border border-gray-200 print:rounded-none print:shadow-none print:border-0">
          {/* Header Bar (Hidden in Print) */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 print:hidden sticky top-0 bg-white z-10">
            <h1 className="text-2xl font-bold text-gray-900">Invoices Details</h1>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Download Button Bar (Hidden in Print) */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 print:hidden flex justify-between items-center">
            <button
              onClick={onClose}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-transparent border-none cursor-pointer"
            >
              ← Back to Invoice
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-semibold flex items-center gap-2"
            >
              <Download size={16} /> Download
            </button>
          </div>

          {/* Invoice Content */}
          <div className="p-10 print:p-0">
            {/* Preadmin Header */}
            <div className="flex justify-between items-start mb-6 pb-5 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-red-600 mb-1">❋ Preadmin</h2>
                <p className="text-sm text-gray-600">3099 Kennedy Court Framingham, MA 01702</p>
              </div>
              <div className="text-right text-sm text-gray-700">
                <p className="mb-1"><span className="font-medium text-gray-900">Invoice No :</span> <span className="text-red-600 font-bold">#{invoice.invoice_number}</span></p>
                <p className="mb-1"><span className="font-medium">Invoice Date :</span> {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                <p><span className="font-medium">Due date :</span> {new Date(invoice.open_till).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>
            </div>

            {/* From / To / Payment Status Section */}
            <div className="grid grid-cols-3 gap-10 mb-8">
              {/* From */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">From</h4>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-900 mb-1">Preadmin</p>
                  <p className="text-xs">3099 Kennedy Court</p>
                  <p className="text-xs">Framingham, MA 01702</p>
                  <p className="mt-2 text-xs">Email: info@preadmin.com</p>
                  <p className="text-xs">Phone: +1 987 654 3210</p>
                </div>
              </div>

              {/* To */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">To</h4>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-900 mb-1">{invoice.company_name || 'Client'}</p>
                  <p className="text-xs whitespace-pre-wrap">{invoice.bill_to || 'Bill To Address'}</p>
                  {invoice.ship_to && (
                    <>
                      <p className="mt-2 font-medium text-xs text-gray-900">Ship To:</p>
                      <p className="text-xs">{invoice.ship_to}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Status & QR */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Payment Status</h4>
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                    invoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                    invoice.status === 'Unpaid' ? 'bg-red-100 text-red-700' :
                    invoice.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {daysUntilDue > 0 ? `Due in ${daysUntilDue} Days` : 'Overdue'}
                  </span>
                </div>
                <div className="w-20 h-20 bg-gray-100 rounded border border-gray-300 flex items-center justify-center print:hidden">
                  <div className="text-center text-xs text-gray-600">
                    <div className="text-lg">📱</div>
                    <span>QR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice For */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-900">Invoice For:</span> {invoice.description || 'Project Services & Development'}
              </p>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Job Description</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-900">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-900">Price</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-900">Discount</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items && items.length > 0 ? (
                    items.map((item, idx) => {
                      const itemQuantity = item.quantity || 1;
                      const itemRate = parseFloat(item.rate) || parseFloat(item.price) || 0;
                      const itemDiscount = parseFloat(item.discount_percentage) || parseFloat(item.discount) || 0;
                      const itemSubtotal = itemQuantity * itemRate;
                      const itemDiscountAmount = itemSubtotal * (itemDiscount / 100);
                      const itemTotal = itemSubtotal - itemDiscountAmount;

                      return (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-700">{item.item_name || item.description || item.name || 'Item'}</td>
                          <td className="px-3 py-2 text-center text-gray-700">{itemQuantity}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(itemRate)}</td>
                          <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(itemDiscountAmount)}</td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(itemTotal)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 text-gray-700">{invoice?.description || 'Project Services'}</td>
                      <td className="px-3 py-2 text-center text-gray-700">1</td>
                      <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(invoice?.subtotal)}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(invoice?.discount_amount || 0)}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency((invoice?.subtotal || 0) - (invoice?.discount_amount || 0))}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Terms & Notes + Totals Layout */}
            <div className="grid grid-cols-2 gap-10 mb-8">
              {/* Left: Terms & Notes */}
              <div>
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Terms and Conditions</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {invoice.terms_conditions || 'Please pay within 15 days from the date of invoice, overdue interest © 14% will be charged on delayed payments.'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Notes</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {invoice.notes || 'Please quote invoice number when remitting funds.'}
                  </p>
                </div>
              </div>

              {/* Right: Totals */}
              <div className="flex flex-col justify-start">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Sub Total</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Discount({invoice.discount_percentage || 0}%)</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(invoice.discount_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">VAT({invoice.tax_percentage || 0}%)</span>
                    <span className="text-gray-900 font-medium">{formatCurrency(invoice.tax_amount || 0)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-red-600">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-700">
                  <p><span className="font-medium">Amount in Words:</span> {numberToWords(parseInt(invoice.total))}</p>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="flex justify-end mb-8 pt-6 border-t border-gray-200">
              <div className="text-right">
                <div className="h-10 mb-1 border-b border-gray-400 w-32" />
                <p className="font-semibold text-gray-900 text-sm">Ted M. Davis</p>
                <p className="text-xs text-gray-600">Assistant Manager</p>
              </div>
            </div>

            {/* Preadmin Footer */}
            <div className="text-center mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-red-600">❋ Preadmin</h3>
            </div>

            {/* Bank Payment Details */}
            <div className="text-center text-xs text-gray-700 mb-8">
              <p className="mb-1">Payment Made Via bank transfer / Cheque in the name of Thomas Lawler</p>
              <p className="mb-0.5">Bank Name : <span className="font-medium">HDFC Bank</span> | Account Number : <span className="font-medium">45366287987</span> | IFSC : <span className="font-medium">HDFC0018159</span></p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 print:hidden">
              <button
                onClick={() => alert('Clone Invoice functionality')}
                className="px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                © Clone Invoice
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                <Printer size={14} /> Print Invoice
              </button>
            </div>
          </div>

          {/* Footer Copyright (Hidden in Print) */}
          <div className="text-center text-xs text-gray-600 p-4 border-t border-gray-200 print:hidden">
            © 2025 <span className="text-red-600 font-bold">Preadmin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
