import { useState } from 'react';

function ExpenseForm({ people, onAddExpense }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splitType, setSplitType] = useState('equal')
  const [selectedPeople, setSelectedPeople] = useState([])
  const [customAmounts, setCustomAmounts] = useState({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validation
    if (!description.trim()) {
      alert('Please enter a description')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount greater than 0')
      return
    }

    if (!paidBy) {
      alert('Please select who paid')
      return
    }

    if (selectedPeople.length === 0) {
      alert('Please select at least one person to split between')
      return
    }

    // Create expense object
    const expense = {
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      splitBetween: selectedPeople,
      date,
      splitType,
    }

    if (splitType === 'custom') {
      expense.customAmounts = customAmounts
    }

    onAddExpense(expense)

    // BUG: State not clearing after form submission
  }

  const handlePersonToggle = (person) => {
    if (selectedPeople.includes(person)) {
      setSelectedPeople(selectedPeople.filter(p => p !== person))
      const newCustomAmounts = { ...customAmounts }
      delete newCustomAmounts[person]
      setCustomAmounts(newCustomAmounts)
    } else {
      setSelectedPeople([...selectedPeople, person])
      if (splitType === 'custom') {
        setCustomAmounts({
          ...customAmounts,
          [person]: ''
        })
      }
    }
  }

  const handleCustomAmountChange = (person, value) => {
    setCustomAmounts({
      ...customAmounts,
      [person]: value
    })
  }

  const calculateEqualSplit = () => {
    if (selectedPeople.length === 0) return '0.00'
    return (parseFloat(amount || 0) / selectedPeople.length).toFixed(2)
  }

  return (
    <div className="expense-form card">
      <h2>💸 Add Expense</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was the expense for?"
            className="input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Amount ($)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="paidBy">Paid By</label>
          <select
            id="paidBy"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="input select"
          >
            <option value="">Select person...</option>
            {people.map(person => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Split Type</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="equal"
                checked={splitType === 'equal'}
                onChange={(e) => setSplitType(e.target.value)}
              />
              <span>Equal Split</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="custom"
                checked={splitType === 'custom'}
                onChange={(e) => setSplitType(e.target.value)}
              />
              <span>Custom Amounts</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Split Between</label>
          <div className="checkbox-group">
            {people.map(person => (
              <div key={person} className="split-person">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedPeople.includes(person)}
                    onChange={() => handlePersonToggle(person)}
                  />
                  <span>{person}</span>
                </label>
                {splitType === 'equal' && selectedPeople.includes(person) && (
                  <span className="split-amount">
                    ${calculateEqualSplit()}
                  </span>
                )}
                {splitType === 'custom' && selectedPeople.includes(person) && (
                  <input
                    type="number"
                    step="0.01"
                    value={customAmounts[person] || ''}
                    onChange={(e) => handleCustomAmountChange(person, e.target.value)}
                    placeholder="0.00"
                    className="input input-small"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedPeople.length > 0 && splitType === 'equal' && (
          <div className="split-preview">
            <p>Each person will pay: <strong>${calculateEqualSplit()}</strong></p>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block">
          Add Expense
        </button>
      </form>
    </div>
  )
}

export default ExpenseForm