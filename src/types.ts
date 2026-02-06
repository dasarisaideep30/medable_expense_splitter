export interface Person {
  id: string;
  name: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  paidBy: string; // person id
  splitBetween: string[]; // array of person ids
  date: string;
  splitType: 'equal' | 'custom';
  customAmounts?: { [personId: string]: number };
}

export interface Balance {
  [person: string]: number;
}

export interface SimplifiedDebt {
  from: string;
  to: string;
  amount: number;
}
