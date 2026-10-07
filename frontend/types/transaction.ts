export type TransactionType =
  | "CASH_OUT"
  | "SEND_MONEY"
  | "MERCHANT_PAYMENT"
  | "MOBILE_RECHARGE"
  | "ADD_MONEY";

export type TransactionStatus = "SUCCESS" | "FAILED" | "PENDING" | "REVERSED";

export interface Transaction {
  id: string;
  trx_id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  fee: number;
  receiver_phone: string;
  receiver_name?: string;
  channel: string;
  status: TransactionStatus;
  error_code?: string;
  gateway_message?: string;
  meta_info?: Record<string, any>;
  created_at: string;
}
