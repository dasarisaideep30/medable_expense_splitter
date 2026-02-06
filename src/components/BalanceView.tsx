import { Expense, Person } from "../types";
import { calculateBalances, simplifyDebts } from "../utils/expenseUtils";

interface Props {
  people: Person[];
  expenses: Expense[];
}

function BalanceView({ people, expenses }: Props) {

  const totalSpending = expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  const getName = (id: string) =>
    people.find(p => p.id === id)?.name || "Unknown";

  const balances = calculateBalances(people, expenses);
  const settlements = simplifyDebts(balances);

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg transition-all duration-200 hover:-translate-y-1">

      <h2 className="text-2xl mb-6 pb-2 border-b-2 border-gray-200 text-gray-800 flex items-center gap-2">
        <span>💰</span> Balances
      </h2>

      {expenses.length === 0 ? (
        <div className="text-center py-8 text-gray-400 italic">
          Add expenses to see who owes whom.
        </div>
      ) : (
        <>
          <div className="bg-[#8b5cf6] p-4 rounded-lg text-white flex justify-between items-center shadow-md mb-6">
            <span className="text-indigo-50 font-medium">Total Group Spending:</span>
            <span className="text-2xl font-bold">${totalSpending.toFixed(2)}</span>
          </div>

          <h3 className="text-gray-600 mb-2 text-lg">Individual Balances</h3>

          <div className="space-y-3 mb-8">
            {people.map(p => {

              const balance = balances[p.id];
              const isPositive = balance > 0.01;
              const isNegative = balance < -0.01;

              let rowClass = "bg-gray-50 border border-gray-200";
              let amountColor = "text-gray-500";
              let labelText = "Settled";
              let amountText = "";

              if (isPositive) {
                rowClass = "bg-green-100 border border-green-200";
                amountColor = "text-green-700";
                labelText = "is owed";
                amountText = `+$${balance.toFixed(2)}`;
              } else if (isNegative) {
                rowClass = "bg-red-100 border border-red-200";
                amountColor = "text-red-700";
                labelText = "owes";
                amountText = `-$${Math.abs(balance).toFixed(2)}`;
              }

              return (
                <div key={p.id} className={`flex justify-between items-center px-4 py-3 rounded-md ${rowClass}`}>
                  <span className="font-semibold text-gray-900">{p.name}</span>

                  {Math.abs(balance) < 0.01 ? (
                    <span className="text-gray-500 font-medium">Settled</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-medium">{labelText}</span>
                      <span className={`font-bold ${amountColor} text-lg`}>
                        {amountText}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-gray-700 mb-2 text-lg flex items-center gap-2 font-semibold">
              <span>💸</span> Suggested Settlements
            </h3>
            <p className="text-gray-500 text-sm mb-4">Minimum transactions to settle all debts:</p>

            {settlements.length === 0 ? (
              <p className="text-center text-green-600 font-medium py-4 bg-white rounded shadow-sm border border-gray-100">
                All settled up! 🎉
              </p>
            ) : (
              <ul className="space-y-3">
                {settlements.map((s, index) => (
                  <li key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm bg-white p-4 rounded-lg border border-gray-200 shadow-sm gap-2">
                    <div className="flex items-center gap-2 text-[15px] flex-wrap">
                      <span className="text-red-500 font-medium">{getName(s.from)}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-green-600 font-medium">{getName(s.to)}</span>
                    </div>
                    <span className="font-bold text-gray-900 text-lg sm:text-right w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      ${s.amount.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

    </div>
  );
}

export default BalanceView;
