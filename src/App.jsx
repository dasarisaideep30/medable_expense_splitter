import './styles/App.css';

import { useState } from 'react';

import BalanceView from './components/BalanceView';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import PeopleManager from './components/PeopleManager';
import {
  initialExpenses,
  initialPeople,
} from './initialData';

function App() {
  const [people, setPeople] = useState(initialPeople)
  const [expenses, setExpenses] = useState(initialExpenses)

  const addPerson = (name) => {
    // TODO: Implement validation and adding
  }

  const removePerson = (index) => {
    // BUG: This has an off-by-one error
    setPeople(people.filter((_, i) => i !== index + 1))
  }

  const addExpense = (expense) => {
    // TODO: Add new expense with unique ID
  }

  const removeExpense = (id) => {
    // TODO: Implement expense removal
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Splitter</h1>
      </header>

      <main className="app-main">
        <div className="container">
          <div className="left-column">
            <PeopleManager
              people={people}
              expenses={expenses}
              onAddPerson={addPerson}
              onRemovePerson={removePerson}
            />
            <ExpenseForm
              people={people}
              onAddExpense={addExpense}
            />
          </div>

          <div className="right-column">
            <BalanceView
              people={people}
              expenses={expenses}
            />
            <ExpenseList
              expenses={expenses}
              onRemoveExpense={removeExpense}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
