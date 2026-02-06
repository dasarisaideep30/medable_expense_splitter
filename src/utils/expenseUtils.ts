import { Expense, SimplifiedDebt, Person, Balance } from '../types';

export const calculateBalances = (people: Person[], expenses: Expense[]): Balance => {
  const balances: Balance = {};

  // Initialize balances for all people
  people.forEach(person => {
    balances[person.id] = 0;
  });

  expenses.forEach(expense => {
    const paidBy = expense.paidBy;
    const amount = expense.amount;

    // Payer gets positive balance (they are owed money)
    if (balances[paidBy] !== undefined) {
      balances[paidBy] += amount;
    }

    // Splitters get negative balance (they owe money)
    if (expense.splitType === 'equal') {
      const splitCount = expense.splitBetween.length;
      if (splitCount > 0) {
        const splitAmount = amount / splitCount;
        expense.splitBetween.forEach(personId => {
          // If the person is in the list of people (handling potential data consistency)
          if (balances[personId] !== undefined) {
            balances[personId] -= splitAmount;
          }
        });
      }
    } else if (expense.splitType === 'custom' && expense.customAmounts) {
      Object.entries(expense.customAmounts).forEach(([personId, amount]) => {
        if (balances[personId] !== undefined) {
          balances[personId] -= amount;
        }
      });
    }
  });

  return balances;
};

export const simplifyDebts = (balances: Balance): SimplifiedDebt[] => {
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  Object.entries(balances).forEach(([id, amount]) => {
    // Round to 2 decimal places to avoid floating point errors
    const roundedAmount = Math.round(amount * 100) / 100;
    if (roundedAmount < -0.01) {
      debtors.push({ id, amount: Math.abs(roundedAmount) });
    } else if (roundedAmount > 0.01) {
      creditors.push({ id, amount: roundedAmount });
    }
  });

  // Sort to optimize standard debt simplification (largest first often simpler)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: SimplifiedDebt[] = [];

  let i = 0; // debtors index
  let j = 0; // creditors index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // The amount to settle is the minimum of what debtor owes and creditor is owed
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0) {
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: Number(amount.toFixed(2))
      });
    }

    // Update remaining amounts
    debtor.amount -= amount;
    creditor.amount -= amount;

    // Check if settled (using small epsilon for float comparison)
    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
};
