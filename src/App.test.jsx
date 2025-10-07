import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App Component', () => {
  beforeEach(() => {
    // Clear any alerts/confirms
    window.alert = vi.fn()
    window.confirm = vi.fn(() => true)
  })

  it('should render the app header', () => {
    render(<App />)
    expect(screen.getByText('💰 Expense Splitter')).toBeInTheDocument()
  })

  it('should display initial people', () => {
    render(<App />)
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Charlie').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Diana').length).toBeGreaterThan(0)
    expect(screen.getByText('Current Members (4)')).toBeInTheDocument()
  })

  it('should add a new person', async () => {
    render(<App />)
    const input = screen.getByPlaceholderText("Enter person's name")
    const addButton = screen.getByText('Add Person')

    await userEvent.type(input, 'Eve')
    await userEvent.click(addButton)

    expect(screen.getAllByText('Eve').length).toBeGreaterThan(0)
    expect(screen.getByText('Current Members (5)')).toBeInTheDocument()
  })

  it('should prevent adding duplicate people (case-insensitive)', async () => {
    render(<App />)
    const input = screen.getByPlaceholderText("Enter person's name")
    const addButton = screen.getByText('Add Person')

    await userEvent.type(input, 'alice')  // lowercase version of existing Alice
    await userEvent.click(addButton)

    expect(window.alert).toHaveBeenCalledWith('This person already exists')
    expect(screen.getByText('Current Members (4)')).toBeInTheDocument()  // Should still be 4
  })

  // This test is intentionally failing - candidates should fix the bug
  it('should remove a person correctly without off-by-one error', async () => {
    render(<App />)

    // Find all delete buttons (including disabled ones)
    const deleteButtons = screen.getAllByText('❌')

    // Try to remove the first person (Alice)
    // Alice has expenses, so this should fail
    await userEvent.click(deleteButtons[0])
    expect(window.alert).toHaveBeenCalledWith('Cannot remove Alice - they have expenses associated with them')

    // Add a new person without expenses
    const input = screen.getByPlaceholderText("Enter person's name")
    const addButton = screen.getByText('Add Person')
    await userEvent.type(input, 'TestPerson')
    await userEvent.click(addButton)

    // Now we should have 5 people
    expect(screen.getByText('Current Members (5)')).toBeInTheDocument()
    expect(screen.getAllByText('TestPerson').length).toBeGreaterThan(0)

    // Get updated delete buttons
    const updatedDeleteButtons = screen.getAllByText('❌')

    // Remove TestPerson (last person, index 4)
    await userEvent.click(updatedDeleteButtons[4])

    // TestPerson should be removed
    expect(screen.queryByText('TestPerson')).not.toBeInTheDocument()
    expect(screen.getByText('Current Members (4)')).toBeInTheDocument()

    // Original 4 people should still be there
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Charlie').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Diana').length).toBeGreaterThan(0)
  })

  it('should prevent removing people below minimum of 2', async () => {
    // Create a fresh app with only 2 people
    const { rerender } = render(<App />)

    // We need to simulate having only 2 people
    // This would require modifying the initial data or state
    // For this test, we'll check the alert message

    // Note: In a real scenario, you'd need to remove people first
    // to get down to 2, then try to remove another
  })

  it('should display initial expenses', () => {
    render(<App />)
    expect(screen.getByText('Lunch at restaurant')).toBeInTheDocument()
    expect(screen.getByText('Uber to airport')).toBeInTheDocument()
    expect(screen.getByText('Concert tickets')).toBeInTheDocument()
  })

  it('should calculate total group spending', () => {
    render(<App />)
    // 120 + 45 + 200 = 365
    expect(screen.getByText('$365.00')).toBeInTheDocument()
  })
})

describe('Expense Form', () => {
  it('should validate required fields', async () => {
    render(<App />)

    // Find the Add Expense button
    const addExpenseButton = screen.getByRole('button', { name: /add expense/i })

    // Try to submit without filling fields
    await userEvent.click(addExpenseButton)

    expect(window.alert).toHaveBeenCalledWith('Please enter a description')
  })

  it('should validate amount is greater than 0', async () => {
    render(<App />)

    const descriptionInput = screen.getByPlaceholderText('What was the expense for?')
    const amountInput = screen.getByPlaceholderText('0.00')
    const addExpenseButton = screen.getByRole('button', { name: /add expense/i })

    await userEvent.type(descriptionInput, 'Test expense')
    await userEvent.type(amountInput, '0')
    await userEvent.click(addExpenseButton)

    expect(window.alert).toHaveBeenCalledWith('Please enter a valid amount greater than 0')
  })

  // Test for the form clearing bug
  it('should clear form after successful submission', async () => {
    render(<App />)

    const descriptionInput = screen.getByPlaceholderText('What was the expense for?')
    const amountInput = screen.getByPlaceholderText('0.00')
    const paidBySelect = screen.getByLabelText('Paid By')

    // Fill the form
    await userEvent.type(descriptionInput, 'Test expense')
    await userEvent.type(amountInput, '50')
    await userEvent.selectOptions(paidBySelect, 'Alice')

    // Select people to split between
    const aliceCheckbox = screen.getAllByRole('checkbox')[0]
    await userEvent.click(aliceCheckbox)

    // Submit the form
    const addExpenseButton = screen.getByRole('button', { name: /add expense/i })
    await userEvent.click(addExpenseButton)

    // BUG: Form should be cleared but it's not
    // This assertion will fail until the bug is fixed
    expect(descriptionInput.value).toBe('')  // This will fail!
    expect(amountInput.value).toBe('')
  })
})