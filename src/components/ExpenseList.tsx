import { useState } from "react";
import { Expense, Person } from "../types";
import Modal from "./Modal";

interface Props {
  expenses: Expense[];
  people: Person[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

function ExpenseList({ expenses, setExpenses, people }: Props) {

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const getPersonName = (id: string) => {
    return people.find(p => p.id === id)?.name || "Unknown";
  };

  const confirmDelete = () => {
    if (deleteId) {
      setExpenses(prev => prev.filter(exp => exp.id !== deleteId));
      setDeleteId(null);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg transition-all duration-200 hover:-translate-y-1">
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Expense"
        type="danger"
        confirmText="Delete"
        onConfirm={confirmDelete}
      >
        Are you sure you want to delete this expense? This action cannot be undone.
      </Modal>

      <h2 className="text-2xl mb-6 pb-2 border-b-2 border-gray-200 text-gray-800 flex items-center gap-2">
        <span>📝</span> Expense History
      </h2>

      {expenses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-gray-500">No expenses recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map(expense => {

            const isExpanded = expandedId === expense.id;

            return (
              <div
                key={expense.id}
                className={`bg-gray-50 border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md ${isExpanded ? 'border-indigo-200 shadow-md' : 'border-gray-200'}`}
              >

                {/* Header */}
                <div
                  className="flex justify-between items-start p-4 cursor-pointer select-none"
                  onClick={() => toggleExpand(expense.id)}
                  role="button"
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleExpand(expense.id);
                  }}
                  tabIndex={0}
                >

                  <div className="flex flex-col gap-1">
                    <h4 className="font-semibold text-gray-800 text-[17px]">{expense.description}</h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(expense.date)} <span className="mx-1.5 text-gray-300">|</span> <span className="text-gray-500">Paid by <span className="font-medium text-gray-700">{getPersonName(expense.paidBy)}</span></span>
                    </p>
                  </div>

                  <div className="flex gap-4 items-center pt-1">
                    <strong className="text-[17px] text-gray-900 font-bold">${expense.amount.toFixed(2)}</strong>
                    <span className={`text-gray-400 transform transition-transform duration-200 flex items-center ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true">
                      ▼
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 bg-white border-t border-gray-100 animate-fadeIn">

                    <h5 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Split Details ({expense.splitType})</h5>

                    <div className="space-y-2 mb-4">
                      {expense.splitBetween.map(personId => {
                        let share = 0;
                        if (expense.splitType === "equal") {
                          share = expense.amount / expense.splitBetween.length;
                        }
                        if (expense.splitType === "custom" && expense.customAmounts) {
                          share = expense.customAmounts[personId] || 0;
                        }

                        return (
                          <div key={personId} className="flex justify-between text-sm items-center p-3 bg-gray-50 rounded-md gap-2">
                            <span className="text-gray-800 font-bold truncate min-w-0">{getPersonName(personId)}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-gray-500 text-xs text-right w-10 sm:w-12">owes</span>
                              <span className="font-bold text-red-500 w-16 sm:w-20 text-right">${share.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(expense.id);
                        }}
                        className="flex items-center gap-2 bg-[#ef4444] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <span>🗑️</span> Delete Expense
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {expenses.length > 0 && (
        <div className="mt-8 bg-gray-50 border border-gray-100 rounded-lg py-3 text-center text-gray-600">
          Total Expenses: <span className="font-bold text-gray-900">{expenses.length}</span>
        </div>
      )}

    </div>
  );
}

export default ExpenseList;
