// Tab Navigation
document.getElementById('dashboardTab').addEventListener('click', function () {
  switchTab('dashboard');
});

document.getElementById('transactionsTab').addEventListener('click', function () {
  switchTab('transactions');
});

document.getElementById('savingsTab').addEventListener('click', function () {
  switchTab('savings');
});

document.getElementById('paymentsTab').addEventListener('click', function () {
  switchTab('payments');
});

function switchTab(tabName) {
  // Hide all tab content
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Show the selected tab content
  document.getElementById(tabName).classList.add('active');

  // Update tab button styles
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Set the default tab to Dashboard
switchTab('dashboard');

// Add event listener for updating the balance
document.getElementById('editBalanceBtn').addEventListener('click', function () {
  const editForm = document.getElementById('editBalanceForm');
  editForm.style.display = editForm.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('updateBalance').addEventListener('click', function () {
  const newBalance = parseFloat(document.getElementById('editBalanceInput').value);
  if (!isNaN(newBalance)) {
    updateTotalBalance(newBalance);
    document.getElementById('editBalanceInput').value = ''; // Clear the input field
    document.getElementById('editBalanceForm').style.display = 'none'; // Hide the form
  } else {
    alert('Please enter a valid number for the balance.');
  }
});

function updateTotalBalance(newBalance) {
  // Save the new balance to localStorage
  localStorage.setItem('manualBalance', newBalance);

  // Update the dashboard
  updateDashboard();
}

// Add event listener for the transaction form
document.getElementById('transactionForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Get form values
  const date = document.getElementById('date').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const type = document.getElementById('type').value;
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;

  // Create a new transaction object
  const transaction = { date, amount, type, category, description };

  // Add the transaction to the table
  addTransactionToTable(transaction);

  // Save the transaction to localStorage
  saveTransaction(transaction);

  // Update the dashboard
  updateDashboard();

  // Clear the form
  document.getElementById('transactionForm').reset();
});

// Add event listener for the savings goal form
document.getElementById('savingsGoalForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const goalName = document.getElementById('goalName').value;
  const goalAmount = parseFloat(document.getElementById('goalAmount').value);

  if (goalName && goalAmount) {
    addSavingsGoal(goalName, goalAmount);
    document.getElementById('savingsGoalForm').reset();
  }
});

// Add event listener for the monthly payment form
document.getElementById('monthlyPaymentForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('paymentName').value;
  const totalAmount = parseFloat(document.getElementById('paymentAmount').value);
  const monthlyAmount = parseFloat(document.getElementById('monthlyPaymentAmount').value);
  const remaining = parseInt(document.getElementById('paymentRemaining').value);

  if (name && totalAmount && monthlyAmount && remaining) {
    addMonthlyPayment(name, totalAmount, monthlyAmount, remaining);
    document.getElementById('monthlyPaymentForm').reset();
  }
});

// Add event listener for clearing all transactions
document.getElementById('clearAll').addEventListener('click', function () {
  if (confirm('Are you sure you want to clear all transactions?')) {
    localStorage.removeItem('transactions');
    document.getElementById('transactionTable').getElementsByTagName('tbody')[0].innerHTML = '';
    updateDashboard();
  }
});

// Function to add a transaction to the table
function addTransactionToTable(transaction) {
  const table = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];
  const row = table.insertRow();

  row.insertCell(0).textContent = transaction.date;
  row.insertCell(1).textContent = `$${transaction.amount.toFixed(2)}`;
  row.insertCell(2).textContent = transaction.type;
  row.insertCell(3).textContent = transaction.category;
  row.insertCell(4).textContent = transaction.description;

  // Add a delete button
  const deleteCell = row.insertCell(5);
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.addEventListener('click', function () {
    row.remove();
    deleteTransaction(transaction);
    updateDashboard();
  });
  deleteCell.appendChild(deleteBtn);
}

// Function to save a transaction to localStorage
function saveTransaction(transaction) {
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Function to delete a transaction from localStorage
function deleteTransaction(transactionToDelete) {
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions = transactions.filter(transaction =>
    transaction.date !== transactionToDelete.date ||
    transaction.amount !== transactionToDelete.amount ||
    transaction.type !== transactionToDelete.type ||
    transaction.category !== transactionToDelete.category ||
    transaction.description !== transactionToDelete.description
  );
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Function to add a savings goal
function addSavingsGoal(name, amount) {
  const goal = { name, amount, saved: 0 };
  const goals = JSON.parse(localStorage.getItem('savingsGoals')) || [];
  goals.push(goal);
  localStorage.setItem('savingsGoals', JSON.stringify(goals));
  displaySavingsGoals();
}

// Function to display savings goals
function displaySavingsGoals() {
  const goals = JSON.parse(localStorage.getItem('savingsGoals')) || [];
  const list = document.getElementById('savingsGoalsList');
  list.innerHTML = goals.map(goal => `
    <li>
      <span>${goal.name}: $${goal.saved.toFixed(2)} / $${goal.amount.toFixed(2)}</span>
      <button onclick="deleteGoal('${goal.name}')">Delete</button>
    </li>
  `).join('');
}

// Function to delete a savings goal
function deleteGoal(name) {
  let goals = JSON.parse(localStorage.getItem('savingsGoals')) || [];
  goals = goals.filter(goal => goal.name !== name);
  localStorage.setItem('savingsGoals', JSON.stringify(goals));
  displaySavingsGoals();
}

// Function to add a monthly payment
function addMonthlyPayment(name, totalAmount, monthlyAmount, remaining) {
  const payment = { name, totalAmount, monthlyAmount, remaining };
  const payments = JSON.parse(localStorage.getItem('monthlyPayments')) || [];
  payments.push(payment);
  localStorage.setItem('monthlyPayments', JSON.stringify(payments));
  displayMonthlyPayments();
  updateDashboard(); // Update the dashboard when a new payment is added
}

// Function to display monthly payments
function displayMonthlyPayments() {
  const payments = JSON.parse(localStorage.getItem('monthlyPayments')) || [];
  const list = document.getElementById('monthlyPaymentsList');
  list.innerHTML = payments.map((payment, index) => `
    <li>
      <span>${payment.name}: $${payment.totalAmount.toFixed(2)} total, $${payment.monthlyAmount.toFixed(2)}/month (${payment.remaining} payments remaining)</span>
      <button onclick="editPayment(${index})" class="edit-icon"><i class="fas fa-pen"></i></button>
      <button onclick="deletePayment(${index})" class="delete-btn">Delete</button>
    </li>
  `).join('');
}

// Function to edit a monthly payment
function editPayment(index) {
  const payments = JSON.parse(localStorage.getItem('monthlyPayments')) || [];
  const payment = payments[index];

  // Find the list item
  const listItem = document.getElementById('monthlyPaymentsList').children[index];

  // Replace the text with editable input fields
  listItem.innerHTML = `
    <input type="text" id="editPaymentName" value="${payment.name}" placeholder="Payment Name" required>
    <input type="number" id="editTotalAmount" value="${payment.totalAmount}" placeholder="Total Amount" required>
    <input type="number" id="editMonthlyAmount" value="${payment.monthlyAmount}" placeholder="Monthly Payment" required>
    <input type="number" id="editRemainingPayments" value="${payment.remaining}" placeholder="Payments Remaining" required>
    <button onclick="savePayment(${index})">Save</button>
    <button onclick="cancelEdit(${index})">Cancel</button>
  `;
}

// Function to save the edited payment
function savePayment(index) {
  const name = document.getElementById('editPaymentName').value;
  const totalAmount = parseFloat(document.getElementById('editTotalAmount').value);
  const monthlyAmount = parseFloat(document.getElementById('editMonthlyAmount').value);
  const remaining = parseInt(document.getElementById('editRemainingPayments').value);

  if (name && totalAmount && monthlyAmount && remaining) {
    const payments = JSON.parse(localStorage.getItem('monthlyPayments')) || [];
    payments[index] = { name, totalAmount, monthlyAmount, remaining };
    localStorage.setItem('monthlyPayments', JSON.stringify(payments));
    displayMonthlyPayments(); // Refresh the list
    updateDashboard(); // Update the dashboard
  } else {
    alert('Please fill in all fields with valid values.');
  }
}

// Function to cancel editing
function cancelEdit(index) {
  displayMonthlyPayments(); // Refresh the list to cancel editing
}

// Function to delete a monthly payment
function deletePayment(index) {
  const payments = JSON.parse(localStorage.getItem('monthlyPayments')) || [];
  payments.splice(index, 1);
  localStorage.setItem('monthlyPayments', JSON.stringify(payments));
  displayMonthlyPayments();
  updateDashboard(); // Update the dashboard when a payment is deleted
}

// Function to update the dashboard
function updateDashboard() {
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  let totalBalance = parseFloat(localStorage.getItem('manualBalance')) || 0;
  let totalIncome = 0;
  let totalExpenses = 0;

  // Calculate total income and expenses
  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalBalance += transaction.amount;
      totalIncome += transaction.amount;
    } else {
      totalBalance -= transaction.amount;
      totalExpenses += transaction.amount;
    }
  });

  // Update total balance, income, and expenses
  document.getElementById('totalBalance').textContent = `$${totalBalance.toFixed(2)}`;
  document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
  document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;

  // Update monthly payments in the dashboard
  updateMonthlyPaymentsDashboard();
}

// Function to update monthly payments in the dashboard
function updateMonthlyPaymentsDashboard() {
  const payments = JSON.parse(localStorage.getItem('monthlyPayments')) || [];
  const list = document.getElementById('dashboardMonthlyPaymentsList');
  const totalMonthlyPayments = payments.reduce((sum, payment) => sum + payment.monthlyAmount, 0);

  // Update total monthly payments
  document.getElementById('totalMonthlyPayments').textContent = `$${totalMonthlyPayments.toFixed(2)}`;

  // Display monthly payments
  list.innerHTML = payments.map(payment => `
    <li>
      <span>${payment.name}: $${payment.monthlyAmount.toFixed(2)}/month (${payment.remaining} payments remaining)</span>
    </li>
  `).join('');
}

// Load transactions, savings goals, and monthly payments when the page loads
window.addEventListener('load', function () {
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions.forEach(addTransactionToTable);
  updateDashboard();
  displaySavingsGoals();
  displayMonthlyPayments();
});