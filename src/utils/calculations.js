export function calculateBalances(expenses, people) {
  // Initialize balances for all people
  const balances = {}
  people.forEach(person => {
    balances[person] = 0
  })

  // Process each expense
  expenses.forEach(expense => {
    const { amount, paidBy, splitBetween, splitType, customAmounts } = expense

    // Person who paid gets positive balance
    // BUG: This overwrites previous balance
    balances[paidBy] = balances[paidBy] + amount

    // Calculate how much each person owes
    if (splitType === 'equal') {
      const splitAmount = amount / splitBetween.length

      splitBetween.forEach(person => {
        // BUG: Balance calculation adds when it should subtract
        balances[person] += splitAmount
      })
    } else if (splitType === 'custom' && customAmounts) {
      splitBetween.forEach(person => {
        const customAmount = parseFloat(customAmounts[person] || 0)
        // Same bug here
        balances[person] += customAmount
      })
    }
  })

  // BUG: Rounding error in decimal calculations
  // Not properly handling floating point precision
  Object.keys(balances).forEach(person => {
    // This naive rounding can cause issues with repeating decimals
    balances[person] = Math.round(balances[person] * 100) / 100
  })

  return balances
}

export function simplifyDebts(balances) {
  const debts = []

  // Separate creditors and debtors
  const creditors = []
  const debtors = []

  Object.entries(balances).forEach(([person, balance]) => {
    if (balance > 0.01) {
      creditors.push({ person, amount: balance })
    } else if (balance < -0.01) {
      debtors.push({ person, amount: Math.abs(balance) })
    }
  })

  // Sort for optimal matching
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  // Match creditors with debtors
  let i = 0, j = 0

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]
    const debtor = debtors[j]

    const amount = Math.min(creditor.amount, debtor.amount)

    if (amount > 0.01) {
      debts.push({
        from: debtor.person,
        to: creditor.person,
        amount: Math.round(amount * 100) / 100
      })
    }

    creditor.amount -= amount
    debtor.amount -= amount

    if (creditor.amount < 0.01) i++
    if (debtor.amount < 0.01) j++
  }

  return debts
}

// Helper function to validate expense totals
export function validateExpenseSplit(expense) {
  const { amount, splitType, splitBetween, customAmounts } = expense

  if (splitType === 'equal') {
    // For equal splits, just check that there are participants
    return splitBetween.length > 0
  } else if (splitType === 'custom') {
    // For custom splits, ensure amounts add up to total
    const totalCustom = splitBetween.reduce((sum, person) => {
      return sum + parseFloat(customAmounts[person] || 0)
    }, 0)

    // Check if custom amounts equal the total (with small tolerance for rounding)
    return Math.abs(totalCustom - amount) < 0.01
  }

  return false
}

// Helper to get a summary of who owes whom directly
export function getDirectDebts(expenses) {
  const directDebts = {}

  expenses.forEach(expense => {
    const { amount, paidBy, splitBetween, splitType, customAmounts } = expense

    splitBetween.forEach(person => {
      if (person === paidBy) return // Skip if person paid for themselves

      let owedAmount
      if (splitType === 'equal') {
        owedAmount = amount / splitBetween.length
      } else if (customAmounts) {
        owedAmount = parseFloat(customAmounts[person] || 0)
      }

      const key = `${person}->${paidBy}`
      directDebts[key] = (directDebts[key] || 0) + owedAmount
    })
  })

  return directDebts
}