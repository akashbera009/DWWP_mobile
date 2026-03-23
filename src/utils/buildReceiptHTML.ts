export function buildReceiptHTML(p: {
  payment_id: string; amount?: string; qty?: number
  refill?: number; addon?: string; date: string
  previousLimit: number; newLimit: number; currentUsage: number
}) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#111;background:#fff}
      .brand{font-size:26px;font-weight:700;color:#1a6b6e;letter-spacing:2px;text-align:center}
      .sub{font-size:13px;color:#6b7280;text-align:center;margin-top:4px}
      .badge{display:inline-block;background:#e1f5ee;color:#065f46;font-size:13px;font-weight:600;padding:6px 18px;border-radius:20px;margin:12px auto 24px;display:block;width:fit-content}
      .amt{text-align:center;background:#f0faf9;border-radius:16px;padding:24px;margin:0 0 24px}
      .amt-lbl{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px}
      .amt-val{font-size:36px;font-weight:700;color:#1a6b6e;margin-top:6px}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      td{padding:10px 0;font-size:13px;border-bottom:1px solid #f3f4f6}
      td:last-child{text-align:right;font-weight:600}
      .quota{background:#f0faf9;border-radius:12px;padding:16px;margin-top:20px}
      .quota-title{font-size:12px;font-weight:600;color:#1a6b6e;margin-bottom:10px}
      .bar-bg{height:10px;background:#e5e7eb;border-radius:10px;overflow:hidden;display:flex}
      .bar-used{height:100%;background:#1a6b6e}
      .bar-add{height:100%;background:#5eead4}
      .footer{text-align:center;font-size:11px;color:#9ca3af;margin-top:40px;border-top:1px solid #f3f4f6;padding-top:20px}
    </style></head><body>
      <div class="brand">DWWP</div>
      <div class="sub">Domestic Water Wastage Prevention</div>
      <div class="badge">✓ Payment Successful</div>
      <div class="amt">
        <div class="amt-lbl">Amount Paid</div>
        <div class="amt-val">${p.amount}</div>
      </div>
      <table>
        <tr><td>Payment Type</td><td>Water Quota Refill</td></tr>
        <tr><td>Plan / Addon</td><td>${p.addon ?? '—'}</td></tr>
        <tr><td>Quantity</td><td>${p.qty} unit${p.qty !== 1 ? 's' : ''}</td></tr>
        <tr><td>Quota Added</td><td>${p.refill?.toLocaleString()} L</td></tr>
        <tr><td>Transaction ID</td><td style="word-break:break-all">${p.payment_id}</td></tr>
        <tr><td>Date & Time</td><td>${p.date}</td></tr>
      </table>
      <div class="quota">
        <div class="quota-title">Quota Updated · ${p.previousLimit.toLocaleString()} L → ${p.newLimit.toLocaleString()} L</div>
        <div class="bar-bg">
          <div class="bar-used" style="width:${Math.min((p.currentUsage / p.newLimit) * 100, 100).toFixed(1)}%"></div>
          <div class="bar-add"  style="width:${Math.min((p?.refill || 0 / p.newLimit) * 100, 100).toFixed(1)}%"></div>
        </div>
        <div style="font-size:11px;color:#6b7280;margin-top:8px">
          Used: ${p.currentUsage.toLocaleString()} L &nbsp;|&nbsp;
          Added: ${p.refill?.toLocaleString()} L &nbsp;|&nbsp;
          New limit: ${p.newLimit.toLocaleString()} L
        </div>
      </div>
      <div class="footer">Thank you for using DWWP · This is a computer-generated receipt</div>
    </body></html>`
}
