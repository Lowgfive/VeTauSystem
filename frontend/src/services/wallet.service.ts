import { apiClient } from "../config/api";

export async function getBalance() {
  const res = await apiClient.get("/wallet/balance");
  return res.data;
}

export async function deposit(amount: number) {
  const res = await apiClient.post("/wallet/deposit", { amount });
  return res.data;
}

export async function createDepositPayment(amount: number) {
  const res = await apiClient.post("/payments/create-deposit-payment", { amount });
  return res.data;
}

export async function getTransactions() {
  const res = await apiClient.get("/wallet/transactions");
  return res.data;
}
