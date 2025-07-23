import { apiClient } from "../utils/api";

export interface SaleItem {
  id: number;
  user_id: number;
  article_id: number;
  amount: string;
  status: string;
  paid_at: string;
  created_at: string;
  article_title: string;
  article_price: string;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  user: {
    id: number;
    name: string;
    username: string;
  };
  article: {
    id: number;
    title: string;
    price: string;
  };
}

export interface SalesSummary {
  total_sales: number;
  total_count: number;
  total_commission: number;
  total_net: number;
}

export interface MonthlySale {
  month: string;
  sales_count: number;
  total_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
}

export interface Payout {
  id: number;
  user_id: number;
  period: string;
  amount: string;
  gross_amount: string;
  commission_amount: string;
  commission_rate: string;
  status: "unpaid" | "paid" | "failed";
  paid_at: string | null;
  bank_account_info: any;
  created_at: string;
  updated_at: string;
}

export interface PayoutSummary {
  total_gross: number;
  total_commission: number;
  total_net: number;
  total_paid: number;
  pending_amount: number;
}

export interface PayoutScheduleItem {
  period: string;
  payout_amount: number;
  carry_over_amount: number;
  total_amount: number;
  scheduled_date: string | null;
  status: "scheduled" | "carry_over";
}

export const salesApi = {
  // 売上履歴取得
  async getSales(month?: string, page?: number) {
    const params: { month?: string; page?: number } = {};
    if (month) params.month = month;
    if (page) params.page = page;

    const response = await apiClient.get<{
      data: { data: SaleItem[]; current_page: number; last_page: number };
      summary: SalesSummary;
    }>("/sales", { params });
    return response.data;
  },

  // 月別売上集計取得
  async getMonthlySummary() {
    const response = await apiClient.get<{ data: MonthlySale[] }>(
      "/sales/monthly",
    );
    return response.data;
  },

  // 振込履歴取得
  async getPayouts() {
    const response = await apiClient.get<{
      data: { data: Payout[]; current_page: number; last_page: number };
      summary: PayoutSummary;
    }>("/sales/payouts");
    return response.data;
  },

  // 振込予定取得
  async getPayoutSchedule() {
    const response = await apiClient.get<{
      data: PayoutScheduleItem[];
      carry_over_balance: number;
    }>("/sales/payout-schedule");
    return response.data;
  },
};
