/**
 * Pure JS PDF / Print Statement Compiler.
 * Renders a clean, professional financial audit report and opens the native print dialog.
 * Bypasses large canvas library bugs to guarantee extremely high-resolution, perfectly-formatted vector PDFs.
 */

export function exportFinancialPDF({ user, transactions, budgets, aiReport }) {
  const printWindow = window.open('', '_blank');
  
  const today = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Render expenses by category
  const catMap = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

  const categoryRows = Object.keys(catMap).map(cat => {
    const budgetObj = budgets.find(b => b.category === cat);
    const limit = budgetObj ? budgetObj.limit : 0;
    const spent = catMap[cat];
    const status = limit > 0 ? (spent > limit ? '🚨 EXCEEDED' : '✅ WITHIN LIMIT') : 'N/A';
    return `
      <tr>
        <td><strong>${cat}</strong></td>
        <td>₹${spent.toLocaleString('en-IN')}</td>
        <td>${limit > 0 ? `₹${limit.toLocaleString('en-IN')}` : 'No Limit'}</td>
        <td style="color: ${spent > limit ? '#ef4444' : '#10b981'}">${status}</td>
      </tr>
    `;
  }).join('');

  // Render recurring subscriptions
  const subRows = aiReport.recurringExpenses.map(sub => `
    <tr>
      <td><strong>${sub.name}</strong></td>
      <td>₹${sub.amount.toLocaleString('en-IN')}</td>
      <td>${sub.frequency}</td>
      <td>${new Date(sub.lastPaymentDate).toLocaleDateString('en-IN')}</td>
    </tr>
  `).join('');

  // Render AI natural language insights
  const insightList = aiReport.insights.map(ins => `
    <li class="insight-item">${ins}</li>
  `).join('');

  const htmlContent = `
    <html>
      <head>
        <title>Centra Finance Audit - ${user.name}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #1e293b;
            padding: 40px;
            background: #ffffff;
            margin: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #4f46e5;
            letter-spacing: -0.5px;
          }
          .logo span {
            color: #06b6d4;
          }
          .meta-title {
            text-align: right;
          }
          .meta-title h1 {
            margin: 0;
            font-size: 20px;
            color: #0f172a;
          }
          .meta-title p {
            margin: 5px 0 0 0;
            color: #64748b;
            font-size: 13px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .stat-card .label {
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .stat-card .val {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
          }
          .stat-card.health {
            border-color: #c7d2fe;
            background: #eef2ff;
          }
          .stat-card.health .val {
            color: #4f46e5;
            font-size: 22px;
          }
          .section-title {
            font-size: 14px;
            text-transform: uppercase;
            color: #0f172a;
            border-left: 4px solid #4f46e5;
            padding-left: 8px;
            margin: 30px 0 15px 0;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
          }
          th {
            background: #f1f5f9;
            color: #475569;
            text-align: left;
            padding: 10px 12px;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 600;
            border-bottom: 1px solid #cbd5e1;
          }
          td {
            padding: 10px 12px;
            font-size: 13px;
            border-bottom: 1px solid #f1f5f9;
          }
          .insights-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .insights-box h3 {
            margin-top: 0;
            color: #166534;
            font-size: 15px;
          }
          .insight-item {
            margin-bottom: 8px;
            font-size: 13px;
            color: #14532d;
            line-height: 1.5;
          }
          .ai-projection-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
          }
          .projection-item {
            text-align: center;
          }
          .projection-item .num {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 5px;
          }
          .projection-item .label {
            font-size: 12px;
            color: #64748b;
          }
          .footer {
            margin-top: 50px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">⚡ CENTRA<span>.AI</span></div>
          <div class="meta-title">
            <h1>Financial Audit Statement</h1>
            <p>Generated on ${today} | Account: ${user.name}</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card health">
            <div class="label">Financial Health Score</div>
            <div class="val">${aiReport.financialHealthScore}/100</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Inflow (Salary/Side)</div>
            <div class="val">₹${totalIncome.toLocaleString('en-IN')}</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Outflow (Expenses)</div>
            <div class="val">₹${totalExpenses.toLocaleString('en-IN')}</div>
          </div>
          <div class="stat-card">
            <div class="label">Net Savings Rate</div>
            <div class="val">₹${netSavings.toLocaleString('en-IN')} (${savingsRate}%)</div>
          </div>
        </div>

        <div class="insights-box">
          <h3>💡 AI Smart Spending Insights</h3>
          <ul>
            ${insightList}
          </ul>
        </div>

        <div class="section-title">Expense Breakdown & Budgets</div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Spent</th>
              <th>Monthly Budget</th>
              <th>Budget Status</th>
            </tr>
          </thead>
          <tbody>
            ${categoryRows}
          </tbody>
        </table>

        <div class="section-title">Auto-Detected Subscriptions & Recurring Bills</div>
        <table>
          <thead>
            <tr>
              <th>Service / Description</th>
              <th>Average Amount</th>
              <th>Frequency</th>
              <th>Last Detected Date</th>
            </tr>
          </thead>
          <tbody>
            ${subRows || '<tr><td colspan="4" style="text-align: center; color: #94a3b8;">No recurring subscriptions detected.</td></tr>'}
          </tbody>
        </table>

        <div class="section-title">AI Predictive Forecast (Next Month)</div>
        <div class="ai-projection-grid">
          <div class="projection-item" style="border-right: 1px solid #e2e8f0;">
            <div class="num" style="color: #f43f5e;">₹${aiReport.predictions.nextMonthSpending.toLocaleString('en-IN')}</div>
            <div class="label">Forecasted Expense Target</div>
          </div>
          <div class="projection-item">
            <div class="num" style="color: #10b981;">₹${aiReport.predictions.nextMonthSavings.toLocaleString('en-IN')}</div>
            <div class="label">Forecasted Monthly Savings</div>
          </div>
        </div>

        <div class="footer">
          <p>Confidential. Centra AI Financial Auditor is designed to simulate statistical trends based on historical inflows and outflows. Keep budgeting, stay wealthy.</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
