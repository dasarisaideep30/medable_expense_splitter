import { useState } from "react";
import { Person, Expense } from "../types";
import Modal from "./Modal";

interface Props {
  people: Person[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

function ExpenseForm({ people, setExpenses }: Props) {

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal");
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: number }>({});

  // Removed unused 'error' state - relying on specific Modals now
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const togglePerson = (id: string) => {
    setSelectedPeople(prev =>
      prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const updateCustomAmount = (id: string, value: number) => {
    setCustomAmounts(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");

    const numericAmount = parseFloat(amount);
    const missingFields = [];

    // 0. Pre-Flight Check: Group Size
    if (people.length < 2) {
      setModalMessage("⚠️ Not Enough People\n\nYou need at least 2 people to split expenses.\n\nPlease go to 'Manage People' and add more members.");
      setModalOpen(true);
      return;
    }

    // Basic Field Checks
    if (!description.trim()) missingFields.push("• Description");
    if (!numericAmount) missingFields.push("• Amount");
    if (!date) missingFields.push("• Date");
    if (!paidBy) missingFields.push("• Payer (Paid By)");
    if (selectedPeople.length === 0) missingFields.push("• At least one person to split with");

    // Check for missing Custom Amounts (if custom split is active)
    if (splitType === "custom") {
      selectedPeople.forEach(id => {
        const val = customAmounts[id];
        if (!val || val <= 0) {
          const personName = people.find(p => p.id === id)?.name || "Unknown";
          missingFields.push(`• Custom Amount for ${personName}`);
        }
      });
    }

    if (missingFields.length > 0) {
      setModalMessage(`⚠️ Missing Required Details:\n\n${missingFields.join("\n")}`);
      setModalOpen(true);
      return;
    }

    // Business Logic Validations
    if (numericAmount <= 0) {
      setModalMessage("🚫 Invalid Amount\n\nThe expense amount must be greater than zero.");
      setModalOpen(true);
      return;
    }

    if (splitType === "equal" && selectedPeople.length < 2) {
      setModalMessage("🚫 Invalid Split\n\nAn 'Equal Split' must involve at least 2 people.\n\nIf this is a personal expense, it shouldn't be added here.");
      setModalOpen(true);
      return;
    }

    // NEW CHECK: Self-Split in Custom Mode
    if (splitType === "custom" && selectedPeople.length === 1 && selectedPeople[0] === paidBy) {
      setModalMessage("🚫 Invalid Split\n\nYou cannot split an expense only with yourself.\n\nIf you paid for yourself, it's a personal expense and shouldn't be tracked here.");
      setModalOpen(true);
      return;
    }

    if (splitType === "custom") {
      const totalCustom = Object.values(customAmounts).reduce((a, b) => a + b, 0);

      // Check for mis-match
      if (Math.abs(totalCustom - numericAmount) > 0.01) {
        setModalMessage(`🚫 Split Mismatch\n\nThe sum of custom amounts ($${totalCustom.toFixed(2)}) must equal the total expense amount ($${numericAmount.toFixed(2)}).\n\nDifference: $${(numericAmount - totalCustom).toFixed(2)}`);
        setModalOpen(true);
        return;
      }

      // Check for zero/negative values in custom split for selected people
      const invalidCustomValues = selectedPeople.some(id => {
        const val = customAmounts[id];
        return !val || val <= 0;
      });

      if (invalidCustomValues) {
        setModalMessage("⚠️ Invalid Custom Amounts\n\nAll selected people must have a custom amount greater than zero.");
        setModalOpen(true);
        return;
      }
    }

    const newExpense: Expense = {
      id: Date.now(),
      description,
      amount: numericAmount,
      paidBy,
      date,
      splitBetween: selectedPeople,
      splitType,
      customAmounts: splitType === "custom" ? customAmounts : undefined
    };

    setExpenses(prev => [...prev, newExpense]);

    // Reset and Show Success
    setDescription("");
    setAmount("");
    setDate("");
    setPaidBy("");
    setSelectedPeople([]);
    setCustomAmounts({});

    setSuccess("Expense added successfully! 🎉");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg transition-all duration-200 hover:-translate-y-1">
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Incomplete Details"
        type="info"
      >
        {modalMessage}
      </Modal>

      <h2 className="text-2xl mb-6 pb-2 border-b-2 border-gray-200 text-gray-800">💸 Add Expense</h2>

      {/* Success is fine as an inline banner, but error should be modal only */}
      {success && <p className="text-green-600 mb-3 bg-green-50 p-2 rounded border border-green-100">{success}</p>}

      <form onSubmit={handleSubmit}>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
          <input
            className="w-full border border-gray-300 p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
            placeholder="What was the expense for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Amount ($)</label>
            <input
              className="w-full border border-gray-300 p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="w-full md:w-1/2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
            <input
              className="w-full border border-gray-300 p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">Paid By</label>
          <select
            className="w-full border border-gray-300 p-2.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-gray-900"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            <option value="">Select person...</option>
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">Split Type</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={splitType === "equal"}
                onChange={() => setSplitType("equal")}
                className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="text-gray-900">Equal Split</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={splitType === "custom"}
                onChange={() => setSplitType("custom")}
                className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="text-gray-900">Custom Amounts</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Split Between</label>
          {people.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Add people to split expenses</p>
          ) : (
            <div className="space-y-1">
              {people.map(person => (
                <div
                  key={person.id}
                  className={`flex items-center gap-3 p-3 rounded-md transition-colors ${selectedPeople.includes(person.id) ? 'bg-indigo-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPeople.includes(person.id)}
                    onChange={() => togglePerson(person.id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-gray-300"
                  />
                  <span className="flex-1 text-gray-900">{person.name}</span>

                  {splitType === "custom" && selectedPeople.includes(person.id) && (
                    <input
                      type="number"
                      placeholder="0.00"
                      className="border border-gray-300 p-1.5 rounded w-24 text-sm focus:border-indigo-500 focus:outline-none text-right"
                      onChange={(e) =>
                        updateCustomAmount(person.id, parseFloat(e.target.value))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="w-full bg-indigo-500 text-white px-4 py-2 rounded font-medium shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform active:scale-95"
        >
          Add Expense
        </button>

      </form>
    </div>
  );
}

export default ExpenseForm;
