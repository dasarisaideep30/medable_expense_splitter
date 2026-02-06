import { useState } from "react";
import { Person, Expense } from "../types";
import Modal from "./Modal";

interface Props {
  people: Person[];
  setPeople: React.Dispatch<React.SetStateAction<Person[]>>;
  expenses?: Expense[];
}

function PeopleManager({ people, setPeople, expenses = [] }: Props) {
  const [name, setName] = useState("");
  // Removed unused 'error' state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();

    // 1. Check Empty
    if (!trimmedName) {
      setModalMessage("⚠️ Please enter a name to add a person.");
      setModalOpen(true);
      return;
    }

    // 2. Check Valid Characters (Letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(trimmedName)) {
      setModalMessage("🚫 Invalid Name Format\n\nNames can only contain:\n• Alphabets (A-Z)\n• Spaces\n• Hyphens (-)\n• Apostrophes (')\n\nNumbers and special symbols are not allowed.");
      setModalOpen(true);
      return;
    }

    // 3. Check Duplicate (Case Insensitive)
    if (people.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      setModalMessage(`🚫 Duplicate Person\n\n"${trimmedName}" is already in the list. Please use a unique name/nickname.`);
      setModalOpen(true);
      return;
    }

    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: trimmedName
    };

    setPeople(prev => [...prev, newPerson]);
    setName("");
  };

  const handleRemovePerson = (id: string) => {
    // 1. Check Use in Expenses
    if (expenses.some(exp => exp.paidBy === id || exp.splitBetween.includes(id))) {
      setModalMessage("⚠️ Action Denied\n\nCannot remove this person because they are involved in existing expenses.\n\nPlease delete those expenses first.");
      setModalOpen(true);
      return;
    }

    // 2. Prevent Empty List (Bonus Rule)
    if (people.length <= 1) {
      setModalMessage("⚠️ Action Denied\n\nYou cannot delete the last person. The group must have at least one member.");
      setModalOpen(true);
      return;
    }

    setPeople(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg transition-all duration-200 hover:-translate-y-1">
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={name.trim() ? "Action Denied" : "Missing Information"}
        type={name.trim() ? "danger" : "info"}
      >
        {modalMessage}
      </Modal>

      <h2 className="text-gray-700 mb-4 text-2xl border-b-2 border-gray-200 pb-2">
        👥 Manage People
      </h2>

      {/* Inputs */}
      <form className="flex gap-2 mb-6" onSubmit={handleAddPerson}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter person's name"
          aria-label="New person name"
          className="flex-1 min-w-0 px-3 py-2 border-2 border-gray-200 rounded-md focus:border-indigo-500 transition-colors focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors whitespace-nowrap"
        >
          Add Person
        </button>
      </form>

      <div className="mt-4">
        <h3 className="text-gray-600 my-2 text-lg">
          Current Members ({people.length})
        </h3>

        {people.length === 0 ? (
          <p className="text-center text-gray-400 py-8 italic border-2 border-dashed border-gray-200 rounded-lg">
            No people added yet. Add someone to get started!
          </p>
        ) : (
          <ul className="list-none mt-2 space-y-1">
            {people.map((person) => (
              <li
                key={person.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <span className="font-medium text-gray-900">
                  {person.name}
                </span>

                <button
                  onClick={() => handleRemovePerson(person.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Remove person"
                  aria-label={`Remove ${person.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {people.length < 2 && (
        <p className="bg-yellow-50 text-yellow-800 px-3 py-3 rounded-md mt-4 text-sm border border-yellow-200 flex items-center gap-2">
          <span>⚠️</span> Add at least 2 people to start tracking expenses
        </p>
      )}
    </div>
  );
}

export default PeopleManager;
