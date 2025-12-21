
import { Expense } from "@/types";

// Mock Data
export const mockExpenses = [
  { id: "1", title: "Office Supplies", category: "Office", date: "Dec 5, 2024", amount: 125, status: "paid" },
  { id: "2", title: "Team Lunch", category: "Food", date: "Dec 3, 2024", amount: 96, status: "paid" },
  { id: "3", title: "Software License", category: "Software", date: "Dec 1, 2024", amount: 180, status: "pending" },
  { id: "4", title: "Cloud Hosting", category: "Software", date: "Nov 28, 2024", amount: 240, status: "paid" },
  { id: "5", title: "Client Meeting", category: "Travel", date: "Nov 25, 2024", amount: 450, status: "paid" },
  { id: "6", title: "Marketing Campaign", category: "Marketing", date: "Nov 20, 2024", amount: 840, status: "pending" },
  { id: "7", title: "Office Rent", category: "Office", date: "Nov 15, 2024", amount: 1280, status: "paid" },
  { id: "8", title: "Equipment Purchase", category: "Office", date: "Nov 10, 2024", amount: 549, status: "overdue" },
];

export const fetchDashboardData = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate random error (10% chance)
  if (Math.random() < 0.1) {
    throw new Error("Failed to fetch financial data. Server is unreachable.");
  }

  const totalSpending = mockExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const savings = 5000; // Mock savings goal/current

  return {
    expenses: mockExpenses,
    totalSpending,
    savings,
    budget: 10000
  };
};
