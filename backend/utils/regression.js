/**
 * Simple Ordinary Least Squares (OLS) Linear Regression Implementation.
 * Coded in pure JavaScript for speed, portability, and zero external dependencies.
 */

/**
 * Calculates the linear regression coefficients (slope and intercept).
 * @param {number[]} x - Independent variables (time steps, e.g., [1, 2, 3, 4])
 * @param {number[]} y - Dependent variables (expense/income values)
 * @returns {{slope: number, intercept: number}}
 */
export function calculateRegression(x, y) {
  const n = x.length;
  if (n === 0 || n !== y.length) {
    return { slope: 0, intercept: 0 };
  }
  if (n === 1) {
    return { slope: 0, intercept: y[0] };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

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

/**
 * Predicts the next values in the series.
 * @param {number[]} values - Historical transaction amounts (ordered oldest to newest)
 * @param {number} stepsAhead - Number of future steps to predict (default: 1)
 * @returns {number[]} Array of predicted future values
 */
export function predictNext(values, stepsAhead = 3) {
  if (!Array.isArray(values) || values.length === 0) {
    return Array(stepsAhead).fill(0);
  }

  // If we only have 1 data point, we cannot determine a trend. Return that value.
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
    // Expenses/income shouldn't be predicted as negative, cap at 0
    predictions.push(Math.max(0, Math.round(predictedValue)));
  }

  return predictions;
}

/**
 * Calculates a compound savings trend or financial health indices.
 * @param {number[]} income - Array of monthly incomes
 * @param {number[]} expenses - Array of monthly expenses
 * @returns {{trend: string, ratio: number}}
 */
export function calculateSavingsTrend(income, expenses) {
  const latestIncome = income[income.length - 1] || 0;
  const latestExpense = expenses[expenses.length - 1] || 0;
  const savings = latestIncome - latestExpense;
  const savingsRatio = latestIncome > 0 ? (savings / latestIncome) * 100 : 0;

  let trend = 'neutral';
  if (expenses.length >= 2) {
    const prevExpense = expenses[expenses.length - 2];
    if (latestExpense < prevExpense * 0.95) {
      trend = 'improving'; // Spending went down
    } else if (latestExpense > prevExpense * 1.05) {
      trend = 'declining'; // Spending went up
    }
  }

  return {
    trend,
    savingsRatio: Math.round(savingsRatio),
    latestSavings: savings
  };
}
