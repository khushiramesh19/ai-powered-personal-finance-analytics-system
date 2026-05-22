/**
 * Pure JavaScript client-side AI Financial Analytics Engine.
 * Enables the in-browser Guest Demo Mode to perform exactly the same high-fidelity 
 * ML predictions, subscription detections, and financial score calculations as the Node.js API.
 */

// Helper: Calculate OLS regression parameters
function calculateRegression(x, y) {
  const n = x.length;
  if (n === 0 || n !== y.length) return { slope: 0, intercept: 0 };
  if (n === 1) return { slope: 0, intercept: y[0] };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// Helper: Predict next values
function predictNext(values, stepsAhead = 3) {
  if (!Array.isArray(values) || values.length === 0) {
    return Array(stepsAhead).fill(0);
  }
  if (values.length === 1) {
    return Array(stepsAhead).fill(values[0]);
  }

  const x = values.map((_, index) => index + 1);
  const { slope, intercept } = calculateRegression(x, values);

  const predictions = [];
  const startX = values.length + 1;

  for (let i = 0; i < stepsAhead; i++) {
    const nextX = startX + i;
    const predictedValue = slope * nextX + intercept;
    predictions.push(Math.max(0, Math.round(predictedValue)));
  }
  return predictions;
}

/**
 * Main analysis function processing transaction history and budget limits
 * @param {Array} list - All transactions
 * @param {Array} budgets - Set budget limits
 * @returns {Object} Full AI Financial Health Report
 */
export function analyzeFinanceData(list, budgets = []) {
  if (!list || list.length === 0) {
    return {
      financialHealthScore: 100,
      predictions: { nextMonthSpending: 0, nextMonthSavings: 0, trend: 'neutral', spendingForecast: [0,0,0], incomeForecast: [0,0,0], monthsList: [] },
      insights: ["Please add some transactions to receive AI spend suggestions and a financial health report!"],
      recurringExpenses: []
    };
  }

  // 1. Separate income and expenses
  const expenses = list.filter(t => t.type === 'expense');
  const incomes = list.filter(t => t.type === 'income');

  // Group by Month (YYYY-MM)
  const monthlySpendingMap = {};
  const monthlyIncomeMap = {};

  list.forEach(t => {
    const mKey = new Date(t.date).toISOString().substring(0, 7);
    if (t.type === 'expense') {
      monthlySpendingMap[mKey] = (monthlySpendingMap[mKey] || 0) + t.amount;
    } else {
      monthlyIncomeMap[mKey] = (monthlyIncomeMap[mKey] || 0) + t.amount;
    }
  });

  const allMonths = Array.from(new Set([...Object.keys(monthlySpendingMap), ...Object.keys(monthlyIncomeMap)])).sort();

  const historicalSpending = allMonths.map(m => monthlySpendingMap[m] || 0);
  const historicalIncome = allMonths.map(m => monthlyIncomeMap[m] || 0);

  // Predict future months using OLS Regression
  const spendingPredictions = predictNext(historicalSpending, 3);
  const incomePredictions = predictNext(historicalIncome, 3);

  const nextMonthSpending = spendingPredictions[0] || 0;
  const nextMonthIncome = incomePredictions[0] || 0;
  const nextMonthSavings = Math.max(0, nextMonthIncome - nextMonthSpending);

  // Calculate MoM Savings Trend
  const latestIncome = historicalIncome[historicalIncome.length - 1] || 0;
  const latestExpense = historicalSpending[historicalSpending.length - 1] || 0;
  const savings = latestIncome - latestExpense;
  const savingsRatio = latestIncome > 0 ? (savings / latestIncome) * 100 : 0;

  let trend = 'neutral';
  if (historicalSpending.length >= 2) {
    const prevExpense = historicalSpending[historicalSpending.length - 2];
    if (latestExpense < prevExpense * 0.95) {
      trend = 'improving';
    } else if (latestExpense > prevExpense * 1.05) {
      trend = 'declining';
    }
  }

  // 2. Financial Health Score (Max 100)
  // Categories spent in current month
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const categorySpending = {};
  expenses.forEach(e => {
    const eMonth = new Date(e.date).toISOString().substring(0, 7);
    if (eMonth === currentMonthStr) {
      categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
    }
  });

  let budgetBreaches = 0;
  let totalBudgetsCount = budgets.length;

  budgets.forEach(b => {
    const spent = categorySpending[b.category] || 0;
    if (spent > b.limit) {
      budgetBreaches++;
    }
  });

  // Score Weightings
  const budgetScore = totalBudgetsCount > 0
    ? Math.round(((totalBudgetsCount - budgetBreaches) / totalBudgetsCount) * 40)
    : 40;

  const savingsScore = Math.min(40, Math.round(Math.max(0, savingsRatio) * 1.0));
  const consistencyScore = Math.min(20, allMonths.length * 4); // 4 pts per month of history, max 20

  const financialHealthScore = Math.min(100, Math.max(10, savingsScore + budgetScore + consistencyScore));

  // 3. Smart Spending Insights (Heuristics)
  const insights = [];
  if (savingsRatio < 10) {
    insights.push(`Your savings ratio is critically low at ${Math.round(savingsRatio)}%. Reducing shopping spending by 15% can save ₹2,000/month and boost your credit safety.`);
  } else if (savingsRatio >= 30) {
    insights.push(`Exceptional! You saved ${Math.round(savingsRatio)}% of your income this month. Automate 10% into direct equity or high-yield savings.`);
  } else {
    insights.push(`You saved ${Math.round(savingsRatio)}% this month. Trimming entertainment subscriptions or dining out could easily boost this to 25%.`);
  }

  // Find dominant expense category
  let worstCategory = null;
  let highestSpend = 0;
  const catSpends = {};
  expenses.forEach(e => {
    catSpends[e.category] = (catSpends[e.category] || 0) + e.amount;
    if (catSpends[e.category] > highestSpend) {
      highestSpend = catSpends[e.category];
      worstCategory = e.category;
    }
  });

  if (worstCategory) {
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0) || 1;
    const percentage = Math.round((highestSpend / totalExp) * 100);
    if (percentage > 35) {
      insights.push(`Attention: ${worstCategory} accounts for ${percentage}% of your total spending. Consider locking a tighter budget here.`);
    }
  }

  if (budgetBreaches > 0) {
    insights.push(`Alert: You exceeded budgets in ${budgetBreaches} categories this month. Let's adjust limits to stop leaking wealth.`);
  } else if (totalBudgetsCount > 0) {
    insights.push(`Excellent discipline! You stayed within your budget limits across all active categories.`);
  }

  // 4. Subscription Detection
  const recurringMap = {};
  expenses.forEach(e => {
    const descClean = e.description.toLowerCase().trim() || e.category.toLowerCase();
    if (!descClean || descClean.length < 3) return;

    let key = descClean;
    if (descClean.includes('netflix')) key = 'netflix';
    else if (descClean.includes('spotify')) key = 'spotify';
    else if (descClean.includes('youtube')) key = 'youtube premium';
    else if (descClean.includes('gym')) key = 'gym membership';
    else if (descClean.includes('rent')) key = 'house rent';
    else if (descClean.includes('electricity')) key = 'electricity bill';
    else if (descClean.includes('act fiber')) key = 'broadband internet';

    if (!recurringMap[key]) {
      recurringMap[key] = [];
    }
    recurringMap[key].push(e);
  });

  const recurringExpenses = [];
  Object.keys(recurringMap).forEach(key => {
    const items = recurringMap[key];
    if (items.length >= 2) {
      const avgAmount = Math.round(items.reduce((sum, item) => sum + item.amount, 0) / items.length);
      recurringExpenses.push({
        name: key.toUpperCase(),
        amount: avgAmount,
        frequency: 'Monthly',
        category: items[0].category,
        lastPaymentDate: items.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date,
        confidence: 'High'
      });
    }
  });

  return {
    financialHealthScore,
    predictions: {
      nextMonthSpending,
      nextMonthSavings,
      trend,
      spendingForecast: spendingPredictions,
      incomeForecast: incomePredictions,
      monthsList: allMonths
    },
    insights,
    recurringExpenses
  };
}
