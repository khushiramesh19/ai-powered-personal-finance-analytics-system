/**
 * Realistic Mock Financial Data Generator.
 * Creates a comprehensive, 12-month transaction and budget dataset.
 * Simulates real-world spending patterns, subscription renewals, and salary income.
 */

export function generateMockData() {
  const transactions = [];
  const budgets = [];
  
  const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment'];
  const baseBudgets = {
    Food: 15000,
    Travel: 8000,
    Shopping: 12000,
    Bills: 10000,
    Entertainment: 8000
  };

  // Generate Budgets for current and next month
  const today = new Date();
  const currentMonthStr = today.toISOString().substring(0, 7);
  
  Object.keys(baseBudgets).forEach(cat => {
    budgets.push({
      _id: `b_${cat}_curr`,
      category: cat,
      limit: baseBudgets[cat],
      month: currentMonthStr
    });
  });

  // Generate 12 months of historical transactions
  // Let's create transactions from 12 months ago up to today
  for (let m = 11; m >= 0; m--) {
    const d = new Date();
    d.setMonth(today.getMonth() - m);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

    // 1. Monthly Income (Salary on 1st of every month)
    transactions.push({
      _id: `t_sal_${monthStr}`,
      amount: 85000,
      type: 'income',
      category: 'Salary',
      description: 'Monthly Corporate Salary',
      date: new Date(year, month, 1, 10, 0, 0).toISOString()
    });

    // 2. Side Income (occasional freelancing on 15th every second month)
    if (month % 2 === 0) {
      transactions.push({
        _id: `t_side_${monthStr}`,
        amount: 15000,
        type: 'income',
        category: 'Side Income',
        description: 'Freelance UI/UX Project',
        date: new Date(year, month, 15, 14, 30, 0).toISOString()
      });
    }

    // 3. Recurring Bills / Fixed Expenses (Rent on 3rd of every month)
    transactions.push({
      _id: `t_rent_${monthStr}`,
      amount: 22000,
      type: 'expense',
      category: 'Bills',
      description: 'Apartment Rent Auto-Debit',
      date: new Date(year, month, 3, 9, 0, 0).toISOString()
    });

    // Recurring Subscriptions
    transactions.push({
      _id: `t_netflix_${monthStr}`,
      amount: 649,
      type: 'expense',
      category: 'Entertainment',
      description: 'Netflix Premium Subscription',
      date: new Date(year, month, 5, 8, 15, 0).toISOString()
    });

    transactions.push({
      _id: `t_spotify_${monthStr}`,
      amount: 119,
      type: 'expense',
      category: 'Entertainment',
      description: 'Spotify Premium Family Plan',
      date: new Date(year, month, 12, 11, 45, 0).toISOString()
    });

    // 4. Randomized Variable Expenses (Food, Travel, Shopping, Entertainment)
    // We add some drift/trends to make linear regression forecasts look beautiful and realistic
    // For example, let's make expenses slowly increase or drop over time
    const trendDrift = (11 - m) * 450; // Slowly spending slightly more over the year

    // Food (approx 8-10 items per month)
    const foodItems = [
      { name: 'Swiggy Delivery', base: 450 },
      { name: 'Supermarket Grocery Run', base: 3200 },
      { name: 'Fine Dining Weekend', base: 2800 },
      { name: 'Zomato Pizza Order', base: 650 },
      { name: 'Organic Fruits & Veggies', base: 1200 },
      { name: 'Cafe Coffee & Snacks', base: 380 }
    ];

    foodItems.forEach((food, idx) => {
      // Add random variation
      const randFactor = 0.85 + Math.random() * 0.3; // 85% to 115%
      const finalAmount = Math.round((food.base + trendDrift * 0.1) * randFactor);
      const day = Math.min(28, 2 + idx * 4 + Math.floor(Math.random() * 3));
      
      transactions.push({
        _id: `t_food_${monthStr}_${idx}`,
        amount: finalAmount,
        type: 'expense',
        category: 'Food',
        description: food.name,
        date: new Date(year, month, day, 13, 0, 0).toISOString()
      });
    });

    // Shopping (1-3 items per month)
    const shoppingItems = [
      { name: 'Amazon Electronics', base: 4500 },
      { name: 'Mall Clothes Shopping', base: 3200 },
      { name: 'Home Decor', base: 2500 }
    ];

    // Let's create an overspending spike in month index 8 (approx 3 months ago)
    const shoppingCount = m === 3 ? 3 : 1 + Math.floor(Math.random() * 2);
    for (let s = 0; s < shoppingCount; s++) {
      const item = shoppingItems[s % shoppingItems.length];
      const randFactor = 0.75 + Math.random() * 0.5;
      const finalAmount = Math.round((item.base + trendDrift * 0.2) * randFactor);
      const day = 5 + s * 8 + Math.floor(Math.random() * 4);

      transactions.push({
        _id: `t_shop_${monthStr}_${s}`,
        amount: finalAmount,
        type: 'expense',
        category: 'Shopping',
        description: item.name,
        date: new Date(year, month, day, 16, 20, 0).toISOString()
      });
    }

    // Travel (2-4 items per month)
    const travelItems = [
      { name: 'Uber Rides Weekly', base: 850 },
      { name: 'Ola Cab Commute', base: 620 },
      { name: 'Fuel Refill Petrol', base: 3500 }
    ];

    travelItems.forEach((travel, idx) => {
      const randFactor = 0.9 + Math.random() * 0.2;
      const finalAmount = Math.round(travel.base * randFactor);
      const day = 4 + idx * 7 + Math.floor(Math.random() * 3);

      transactions.push({
        _id: `t_travel_${monthStr}_${idx}`,
        amount: finalAmount,
        type: 'expense',
        category: 'Travel',
        description: travel.name,
        date: new Date(year, month, day, 18, 10, 0).toISOString()
      });
    });

    // Bills (Electricity / Wi-Fi on 10th of every month)
    transactions.push({
      _id: `t_wifi_${monthStr}`,
      amount: 999,
      type: 'expense',
      category: 'Bills',
      description: 'Act Fibernet Broadband',
      date: new Date(year, month, 10, 9, 30, 0).toISOString()
    });

    const electricityAmount = Math.round(3500 + Math.random() * 1500 + trendDrift * 0.05);
    transactions.push({
      _id: `t_elec_${monthStr}`,
      amount: electricityAmount,
      type: 'expense',
      category: 'Bills',
      description: 'State Power Electricity Bill',
      date: new Date(year, month, 18, 10, 15, 0).toISOString()
    });

    // Entertainment (occasional weekend movies/concerts)
    if (Math.random() > 0.3) {
      const moviesAmount = Math.round(1200 + Math.random() * 1800);
      transactions.push({
        _id: `t_ent_${monthStr}_rand`,
        amount: moviesAmount,
        type: 'expense',
        category: 'Entertainment',
        description: 'BookMyShow Movies & Popcorn',
        date: new Date(year, month, 22, 20, 0, 0).toISOString()
      });
    }
  }

  // Sort transactions newest to oldest
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  return { transactions, budgets };
}
