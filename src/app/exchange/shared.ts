// app/exchange/shared.ts
export type MethodId =
  | "paypal" | "payoneer" | "skrill" | "wise" | "usdt" | "bkash" | "nagad" | "bank";

export type Fiat = "USD" | "EUR" | "BDT";
export type TradeStatus = "Started" | "Pending" | "Completed";

export const METHOD_LABELS: Record<MethodId, string> = {
  paypal: "PayPal",
  payoneer: "Payoneer",
  skrill: "Skrill",
  wise: "Wise",
  usdt: "USDT (TRC20)",
  bkash: "bKash",
  nagad: "Nagad",
  bank: "Bank Transfer (BDT)",
};

export const METHOD_CCY: Record<MethodId, Fiat> = {
  paypal: "USD",
  payoneer: "USD",
  skrill: "USD",
  wise: "USD",
  usdt: "USD",
  bkash: "BDT",
  nagad: "BDT",
  bank: "BDT",
};

export const RECEIVING_ACCOUNTS: Record<
  MethodId,
  { fieldLabel: string; value: string; helper?: string }
> = {
  paypal: { fieldLabel: "PayPal Email", value: "example@gmail.com", helper: "Send as Friends & Family if available." },
  payoneer: { fieldLabel: "Payoneer Email", value: "example@domain.com" },
  skrill: { fieldLabel: "Skrill Email", value: "skrillexample@mail.com" },
  wise: { fieldLabel: "Wise Email", value: "wiseaccount@mail.com", helper: "If bank details are required, contact support." },
  usdt: { fieldLabel: "USDT (TRC20) Address", value: "TN1ExampleTRC20WalletAddress12345", helper: "Send only USDT on TRON (TRC20)." },
  bkash: { fieldLabel: "bKash Number", value: "01XXXXXXXXX", helper: "Send via Personal bKash (Send Money)." },
  nagad: { fieldLabel: "Nagad Number", value: "01XXXXXXXXX" },
  bank: {
    fieldLabel: "Bank Account",
    value: "Account Name: Your Company\nAccount No: 01234567890\nBank: ABC Bank, Banani Branch\nRouting: 0123456",
    helper: "Use the exact reference shown below.",
  },
};

export function isMethod(x: string | null): x is MethodId {
  return !!x && x in METHOD_LABELS;
}
