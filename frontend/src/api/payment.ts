import apiClient from "../utils/api";

export interface PaymentData {
  article_id: number;
  card_number: string;
  card_name: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
}

export interface PaymentResponse {
  id: number;
  article_id: number;
  amount: number;
  status: "success" | "failed" | "pending";
  transaction_id: string;
  paid_at: string;
}

export interface PaymentHistoryItem extends PaymentResponse {
  article: {
    id: number;
    title: string;
    price: number;
  };
}

export const paymentApi = {
  /**
   * 記事を購入する
   */
  purchaseArticle: async (data: PaymentData) => {
    const response = await apiClient.post<{
      data: PaymentResponse;
      message: string;
    }>("/api/payments", data);
    return response.data;
  },

  /**
   * 決済履歴を取得する
   */
  getPaymentHistory: async (page = 1) => {
    const response = await apiClient.get<{
      data: PaymentHistoryItem[];
      meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    }>(`/api/payments?page=${page}`);
    return response.data;
  },
};
