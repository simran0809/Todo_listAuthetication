const expenseTable = document.querySelector("#expenses tbody");
const addExpenseBtn = document.getElementById("add-expense-btn");
const addExpensePopup = document.getElementById("add-expense-popup");
const expenseForm = document.getElementById("expense-form");
const expenseGraph = document.getElementById("expense-graph");

// Define Spending constructor with category included
function Spending(title, amount, timeStamp, category) {
  this.title = title;
  this.amount = amount;
  this.timeStamp = timeStamp;
  this.category = category || 'Uncategorized';  // Default category to 'Uncategorized' if none provided
}

function getExpensesFromLocalStorage() {
  const expensesJSON = localStorage.getItem("expenses");
  return expensesJSON ? JSON.parse(expensesJSON).map(e => ({
      ...e,
      timeStamp: new Date(e.timeStamp)
  })) : [];
}

function storeExpensesInLocalStorage(expenses) {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function displayExpenses(expenses) {
  expenseTable.innerHTML = "";
  expenses.forEach(expense => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${expense.title}</td>
      <td>${expense.amount.toFixed(2)}</td>
      <td>${expense.timeStamp.toLocaleDateString()}</td>
      <td>${expense.category}</td>
    `;
    expenseTable.appendChild(row);
  });
}

function filterExpensesForGraph(expenses) {
  const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  return expenses.filter(expense => expense.timeStamp >= sixDaysAgo);
}

function prepareChartData(expenses) {
    const data = [["Date", "Amount"]];
    expenses.forEach(expense => {
      const date = expense.timeStamp.toLocaleDateString();
      const amount = parseFloat(expense.amount); // Ensure amount is parsed as a float
      if (!isNaN(amount)) { // Check if amount is a valid number
        data.push([date, amount]);
      } else {
        console.error(`Invalid amount value for expense: ${expense.title}`);
      }
    });
    return data;
  }

function drawExpenseGraph(data) {
  const chartData = new google.visualization.DataTable();
  chartData.addColumn("string", "Date");
  chartData.addColumn("number", "Amount");
  chartData.addRows(data);

  const options = {
    title: "Daily Expenses (Past 6 Days)",
    legend: { position: "bottom" },
    curveType: "function"
  };

  const chart = new google.visualization.LineChart(expenseGraph);
  chart.draw(chartData, options);
}

function handleExpenseFormSubmit(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const date = new Date(document.getElementById("date").value);
  const category = document.getElementById("category").value; 

  if (!title || isNaN(amount) || isNaN(date.getTime())) {
    alert("Please fill in all fields correctly!");
    return;
  }

  const newExpense = new Spending(title, amount, date, category);

  const existingExpenses = getExpensesFromLocalStorage();
  existingExpenses.push(newExpense);
  storeExpensesInLocalStorage(existingExpenses);

  displayExpenses(existingExpenses);
  addExpensePopup.style.display = "none";
  expenseForm.reset();

  const filteredExpenses = filterExpensesForGraph(existingExpenses);
  const graphData = prepareChartData(filteredExpenses);
  drawExpenseGraph(graphData);
}

addExpenseBtn.addEventListener("click", () => {
  addExpensePopup.style.display = "block";
});

expenseForm.addEventListener('submit', handleExpenseFormSubmit);

window.addEventListener("DOMContentLoaded", () => {
  const expenses = getExpensesFromLocalStorage();
  displayExpenses(expenses);

  // Prepare and draw initial graphs
  const filteredExpenses = filterExpensesForGraph(expenses);
  const graphData = prepareChartData(filteredExpenses);
  drawExpenseGraph(graphData);
});


// Only load Google Charts once and set a callback if needed




function drawCategoryChart() {
    // Fetch expenses from local storage
    const expenses = getExpensesFromLocalStorage();

    // Aggregate expenses by category
    const categoryTotals = expenses.reduce((acc, expense) => {
        if (acc[expense.category]) {
            acc[expense.category] += expense.amount;
        } else {
            acc[expense.category] = expense.amount;
        }
        return acc;
    }, {});

    // Create the data table for Google Charts
    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Category');
    data.addColumn('number', 'Amount');
    
    const chartRows = Object.keys(categoryTotals).map(category => [category, categoryTotals[category]]);
    data.addRows(chartRows);

    // Set chart options
    const options = {
        title: 'Expense Distribution by Category',
        width: 400,
        height: 300,
        pieHole: 0.4, // Optional: for a donut chart
    };

    // Instantiate and draw the chart, passing in some options
    const chart = new google.visualization.PieChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawCategoryChart);

// Load Google Charts library and set the callback

