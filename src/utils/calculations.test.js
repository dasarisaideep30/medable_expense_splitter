import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  calculateBalances,
  getDirectDebts,
  simplifyDebts,
  validateExpenseSplit,
} from './calculations';

describe('calculateBalances', () => {
  it('should calculate correct balances for equal splits', () => {
    // TODO: Implement test

    // Alice paid 100, split 50/50
    // Alice should be owed: 100 - 50 = 50
    // Bob should owe: 50
  })

  it('should handle person paying but not in split', () => {
    // TODO: Implement test

    // Alice paid 60 for Bob and Charlie (30 each)
    // Alice should be owed: 60
    // Bob should owe: 30
    // Charlie should owe: 30
  })

  // This test is intentionally failing - candidates should fix
  it('should handle decimal amounts correctly', () => {
    const expenses = [{
      amount: 100,
      paidBy: "Alice",
      splitBetween: ["Alice", "Bob", "Charlie"],
      splitType: "equal"
    }]
    const balances = calculateBalances(expenses, ["Alice", "Bob", "Charlie"])

    // 100 / 3 = 33.333...
    // Alice paid 100, owes 33.33
    // So Alice should get back: 100 - 33.33 = 66.67
    expect(balances["Alice"]).toBe(66.67) // This will fail due to rounding
    expect(balances["Bob"]).toBe(-33.33)
    expect(balances["Charlie"]).toBe(-33.33)
  })

  it('should handle custom split amounts', () => {
    const expenses = [
      {
        amount: 100,
        paidBy: "Alice",
        splitBetween: ["Alice", "Bob", "Charlie"],
        splitType: "custom",
        customAmounts: {
          "Alice": 20,
          "Bob": 30,
          "Charlie": 50
        }
      }
    ]
    const people = ["Alice", "Bob", "Charlie"]

    const balances = calculateBalances(expenses, people)

    // Alice paid 100, owes 20
    // So Alice should get back: 100 - 20 = 80
    expect(balances["Alice"]).toBe(80)
    expect(balances["Bob"]).toBe(-30)
    expect(balances["Charlie"]).toBe(-50)
  })

  it('should handle multiple expenses correctly', () => {
    const expenses = [
      {
        amount: 60,
        paidBy: "Alice",
        splitBetween: ["Alice", "Bob"],
        splitType: "equal"
      },
      {
        amount: 40,
        paidBy: "Bob",
        splitBetween: ["Alice", "Bob"],
        splitType: "equal"
      }
    ]
    const people = ["Alice", "Bob"]

    const balances = calculateBalances(expenses, people)

    // First expense: Alice paid 60, split 30/30
    // Alice balance: +60 - 30 = +30
    // Bob balance: -30

    // Second expense: Bob paid 40, split 20/20
    // Alice balance: 30 - 20 = +10
    // Bob balance: -30 + 40 - 20 = -10

    expect(balances["Alice"]).toBe(10)
    expect(balances["Bob"]).toBe(-10)
  })
})

describe('simplifyDebts', () => {
  it('should minimize number of transactions', () => {
    // TODO: Test debt simplification
  })

  it('should handle already balanced scenario', () => {
    const balances = {
      "Alice": 0,
      "Bob": 0,
      "Charlie": 0
    }

    const debts = simplifyDebts(balances)

    expect(debts.length).toBe(0)
  })

  it('should correctly match creditors and debtors', () => {
    const balances = {
      "Alice": 100,
      "Bob": -40,
      "Charlie": -60
    }

    const debts = simplifyDebts(balances)

    // Charlie owes Alice 60, Bob owes Alice 40
    expect(debts).toContainEqual({ from: "Charlie", to: "Alice", amount: 60 })
    expect(debts).toContainEqual({ from: "Bob", to: "Alice", amount: 40 })
  })
})

describe('validateExpenseSplit', () => {
  it('should validate equal split correctly', () => {
    const expense = {
      amount: 100,
      splitType: "equal",
      splitBetween: ["Alice", "Bob"]
    }

    expect(validateExpenseSplit(expense)).toBe(true)
  })

  it('should validate custom split when amounts match total', () => {
    const expense = {
      amount: 100,
      splitType: "custom",
      splitBetween: ["Alice", "Bob", "Charlie"],
      customAmounts: {
        "Alice": 25,
        "Bob": 35,
        "Charlie": 40
      }
    }

    expect(validateExpenseSplit(expense)).toBe(true)
  })

  it('should reject custom split when amounts dont match total', () => {
    const expense = {
      amount: 100,
      splitType: "custom",
      splitBetween: ["Alice", "Bob"],
      customAmounts: {
        "Alice": 30,
        "Bob": 30  // Total is 60, not 100
      }
    }

    expect(validateExpenseSplit(expense)).toBe(false)
  })
})

describe('getDirectDebts', () => {
  it('should track direct debts between individuals', () => {
    const expenses = [
      {
        amount: 60,
        paidBy: "Alice",
        splitBetween: ["Alice", "Bob", "Charlie"],
        splitType: "equal"
      }
    ]

    const directDebts = getDirectDebts(expenses)

    expect(directDebts["Bob->Alice"]).toBe(20)
    expect(directDebts["Charlie->Alice"]).toBe(20)
    expect(directDebts["Alice->Alice"]).toBeUndefined() // Should not exist
  })

  it('should accumulate multiple debts between same people', () => {
    const expenses = [
      {
        amount: 40,
        paidBy: "Alice",
        splitBetween: ["Alice", "Bob"],
        splitType: "equal"
      },
      {
        amount: 60,
        paidBy: "Alice",
        splitBetween: ["Alice", "Bob"],
        splitType: "equal"
      }
    ]

    const directDebts = getDirectDebts(expenses)

    // Bob owes Alice 20 + 30 = 50 total
    expect(directDebts["Bob->Alice"]).toBe(50)
  })
})