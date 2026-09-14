import { Router } from 'express'
import { store } from '../db/store.js'

const router = Router()

// GET /api/invoice/:orderId - Generate and render official printable GST Tax Invoice
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await store.getOrderById(orderId)

    if (!order) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Invoice Not Found - VANTA</title>
        <style>body { font-family: sans-serif; text-align: center; padding: 60px; background: #0a0a0b; color: #fff; }</style>
        </head>
        <body>
          <h2>Order Not Found</h2>
          <p>No order record matching reference: ${orderId}</p>
          <a href="/" style="color: #60a5fa;">Return to Storefront</a>
        </body>
        </html>
      `)
    }

    const subtotal = order.pricing?.subtotal || 0
    const discount = order.pricing?.discountAmount || 0
    const taxableValue = Math.max(0, subtotal - discount)
    const gstRate = 0.12 // 12% apparel GST
    const gstAmount = Math.round(taxableValue * (gstRate / (1 + gstRate)))
    const netBase = taxableValue - gstAmount
    const cgst = Math.round(gstAmount / 2)
    const sgst = gstAmount - cgst
    const totalAmount = order.pricing?.totalAmount || 0

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VANTA Tax Invoice - ${order.orderNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f3f4f6;
      color: #111827;
      padding: 24px;
    }
    .invoice-controls {
      max-width: 800px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ctrl-btn {
      padding: 10px 18px;
      font-size: 0.88rem;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .print-btn { background: #111; color: #fff; border: none; }
    .print-btn:hover { background: #333; }
    .back-btn { background: #fff; color: #111; border: 1px solid #d1d5db; }
    .invoice-paper {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .inv-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #111;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand-logo-text {
      font-size: 2rem;
      font-weight: 900;
      letter-spacing: 0.25em;
      color: #000;
    }
    .company-details {
      font-size: 0.78rem;
      color: #4b5563;
      line-height: 1.4;
      margin-top: 6px;
    }
    .inv-meta-block {
      text-align: right;
    }
    .inv-title {
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }
    .inv-meta-row {
      font-size: 0.82rem;
      color: #4b5563;
      margin-bottom: 3px;
    }
    .inv-meta-row strong { color: #111; }
    .addresses-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
      font-size: 0.82rem;
    }
    .addr-box {
      background: #f9fafb;
      padding: 14px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .addr-title {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #6b7280;
      margin-bottom: 6px;
      text-transform: uppercase;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 0.82rem;
    }
    .items-table th {
      background: #f3f4f6;
      padding: 10px 12px;
      text-align: left;
      font-size: 0.72rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-bottom: 1px solid #d1d5db;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .totals-layout {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 20px;
    }
    .payment-note {
      font-size: 0.78rem;
      color: #4b5563;
      max-width: 340px;
    }
    .totals-table {
      width: 280px;
      font-size: 0.82rem;
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      color: #4b5563;
    }
    .tot-row.grand {
      border-top: 2px solid #111;
      padding-top: 8px;
      margin-top: 4px;
      font-weight: 900;
      font-size: 1rem;
      color: #000;
    }
    .inv-footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.74rem;
      color: #6b7280;
    }
    .barcode-mock {
      font-family: monospace;
      letter-spacing: 4px;
      font-size: 1.1rem;
      font-weight: 800;
      color: #000;
      padding: 6px 12px;
      background: #f3f4f6;
      border: 1px dashed #9ca3af;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .invoice-controls { display: none; }
      .invoice-paper { box-shadow: none; border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-controls">
    <a href="/" class="ctrl-btn back-btn">← Return to VANTA Store</a>
    <button type="button" class="ctrl-btn print-btn" onclick="window.print()">🖨️ Print Tax Invoice / Save PDF</button>
  </div>

  <div class="invoice-paper">
    <div class="inv-header">
      <div>
        <div class="brand-logo-text">VANTA</div>
        <div class="company-details">
          <strong>VANTA LUXURY APPAREL PVT. LTD.</strong><br>
          CIN: U18101DL2026PTC109988 • GSTIN: 07AAACV1234F1Z8<br>
          Reg. Office: Plot 44, Okhla Industrial Area Phase III<br>
          New Delhi - 110020, India
        </div>
      </div>
      <div class="inv-meta-block">
        <div class="inv-title">TAX INVOICE</div>
        <div class="inv-meta-row">Invoice No: <strong>INV-${order.orderNumber}</strong></div>
        <div class="inv-meta-row">Order Date: <strong>${new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
        <div class="inv-meta-row">Status: <strong>${order.status}</strong></div>
        <div class="inv-meta-row">Payment: <strong>${order.paymentMethod} (${order.paymentStatus})</strong></div>
      </div>
    </div>

    <div class="addresses-grid">
      <div class="addr-box">
        <div class="addr-title">Billed &amp; Shipped To:</div>
        <strong>${order.customer?.name}</strong><br>
        Phone: ${order.customer?.phone}<br>
        ${order.customer?.email ? `Email: ${order.customer.email}<br>` : ''}
        ${order.customer?.address}<br>
        ${order.customer?.city}, ${order.customer?.state || 'India'} - ${order.customer?.pincode}
      </div>
      <div class="addr-box">
        <div class="addr-title">Logistics &amp; Fulfillment:</div>
        Carrier: <strong>${order.shipping?.method || 'BlueDart Express Priority Air'}</strong><br>
        AWB Tracking: <strong>BLUEDART-EXP-${order.orderNumber}</strong><br>
        Estimated Delivery: <strong>${order.shipping?.estimatedDelivery || '2-4 Business Days'}</strong><br>
        Transit Status: <strong>${order.shipping?.trackingStatus || 'Dispatched'}</strong>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Item Description</th>
          <th>HSN Code</th>
          <th>Size</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${it.title}</strong></td>
            <td>${it.category === 'Hoodie' ? '61102000' : '61091000'}</td>
            <td>${it.size || 'L'}</td>
            <td>${it.quantity || 1}</td>
            <td>₹${Number(it.numericPrice).toLocaleString('en-IN')}</td>
            <td style="text-align: right;">₹${(Number(it.numericPrice) * Number(it.quantity || 1)).toLocaleString('en-IN')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals-layout">
      <div class="payment-note">
        <strong>Terms &amp; Declarations:</strong><br>
        1. All goods sold are crafted under verified fair-trade certified standards.<br>
        2. Complimentary 7-day hassle-free exchange on unwashed apparel with tags attached.<br>
        3. For concierge assistance, email support@vanta.studio quoting your Order #${order.orderNumber}.
      </div>

      <div class="totals-table">
        <div class="tot-row">
          <span>Subtotal</span>
          <span>₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        ${discount > 0 ? `
          <div class="tot-row" style="color: #059669;">
            <span>Discount (${order.pricing?.appliedPromo || 'Coupon'})</span>
            <span>-₹${discount.toLocaleString('en-IN')}</span>
          </div>
        ` : ''}
        <div class="tot-row">
          <span>Net Taxable Base</span>
          <span>₹${netBase.toLocaleString('en-IN')}</span>
        </div>
        <div class="tot-row">
          <span>CGST (6%)</span>
          <span>₹${cgst.toLocaleString('en-IN')}</span>
        </div>
        <div class="tot-row">
          <span>SGST (6%)</span>
          <span>₹${sgst.toLocaleString('en-IN')}</span>
        </div>
        <div class="tot-row">
          <span>Shipping Fee</span>
          <span>${order.pricing?.shippingFee === 0 ? 'FREE' : `₹${order.pricing?.shippingFee}`}</span>
        </div>
        <div class="tot-row grand">
          <span>Total Payable</span>
          <span>₹${totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

    <div class="inv-footer">
      <div>
        <span class="barcode-mock">||| | |||| | ||||| | |||</span>
        <div style="font-size: 0.65rem; color: #6b7280; margin-top: 4px;">AWB: BLUEDART-EXP-${order.orderNumber}</div>
      </div>
      <div style="text-align: right;">
        <strong>Authorised Signatory</strong><br>
        <span style="color: #6b7280;">VANTA™ Official Digital Dispatch Hub</span>
      </div>
    </div>
  </div>
</body>
</html>`

    res.send(html)
  } catch (error) {
    res.status(500).send(`Error generating invoice: ${error.message}`)
  }
})

export default router
