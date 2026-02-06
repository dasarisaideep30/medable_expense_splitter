import { describe, it, expect } from 'vitest';
import { calculateBalances, simplifyDebts } from './expenseUtils';
import { Person, Expense } from '../types';

describe('expenseUtils', () => {
    describe('calculateBalances', () => {
        it('should calculate balances correctly for equal splits', () => {
            const people: Person[] = [
                { id: '1', name: 'Alice' },
                { id: '2', name: 'Bob' },
                { id: '3', name: 'Charlie' }
            ];
            const expenses: Expense[] = [
                {
                    id: 1,
                    description: 'Lunch',
                    amount: 30,
                    paidBy: '1', // Alice
                    splitBetween: ['1', '2', '3'],
                    date: '2024-01-01',
                    splitType: 'equal'
                }
            ];

            const balances = calculateBalances(people, expenses);

            // Alice paid 30, share is 10. Net +20.
            expect(balances['1']).toBeCloseTo(20);
            // Bob share is 10. Net -10.
            expect(balances['2']).toBeCloseTo(-10);
            // Charlie share is 10. Net -10.
            expect(balances['3']).toBeCloseTo(-10);
        });

        it('should calculate balances correctly for custom splits', () => {
            const people: Person[] = [
                { id: '1', name: 'Alice' },
                { id: '2', name: 'Bob' }
            ];
            const expenses: Expense[] = [
                {
                    id: 1,
                    description: 'Dinner',
                    amount: 100,
                    paidBy: '1',
                    splitBetween: ['1', '2'],
                    date: '2024-01-01',
                    splitType: 'custom',
                    customAmounts: {
                        '1': 20,
                        '2': 80
                    }
                }
            ];

            const balances = calculateBalances(people, expenses);

            // Alice paid 100, share 20. Net +80.
            expect(balances['1']).toBeCloseTo(80);
            // Bob share 80. Net -80.
            expect(balances['2']).toBeCloseTo(-80);
        });
    });

    describe('simplifyDebts', () => {
        it('should simplify debts correctly', () => {
            // A owes B 10, B owes C 10 -> A owes C 10
            // In balances: 1: -10, 2: 0, 3: +10
            const balances = {
                '1': -10,
                '2': 0,
                '3': 10
            };

            const transactions = simplifyDebts(balances);

            expect(transactions).toHaveLength(1);
            expect(transactions[0].from).toBe('1');
            expect(transactions[0].to).toBe('3');
            expect(transactions[0].amount).toBeCloseTo(10);
        });
    });
});
