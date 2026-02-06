import { useState } from "react";
import BalanceView from "./components/BalanceView";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import PeopleManager from "./components/PeopleManager";
import { initialPeople, initialExpenses } from "./initialData";
import { Person, Expense } from "./types";

function App() {

  // 👥 People State
  const [people, setPeople] = useState<Person[]>(initialPeople);

  // 💸 Expense State
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-x-hidden">
      <header className="bg-white/10 backdrop-blur-md p-6 text-center border-b border-white/20">
        <h1 className="text-white text-4xl font-bold drop-shadow-lg">
          💰 Expense Splitter
        </h1>
      </header>

      <main className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

          {/* LEFT COLUMN */}
          <div className="w-full lg:w-1/2">
            <PeopleManager
              people={people}
              setPeople={setPeople}
              expenses={expenses}
            />

            <ExpenseForm
              people={people}
              expenses={expenses}
              setExpenses={setExpenses}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-1/2">
            <BalanceView people={people} expenses={expenses} />

            <ExpenseList
              expenses={expenses}
              setExpenses={setExpenses}
              people={people}
            />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
