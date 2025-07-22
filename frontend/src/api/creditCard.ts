import apiClient from "../utils/api";

// クレジットカードデータの型定義
export interface CreditCardData {
  card_number: string;
  card_name: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
}

export interface CreditCardResponse {
  id: number;
  card_brand: string;
  last_four: string;
  masked_card_number: string;
  card_name: string;
  expiry_month: string;
  expiry_year: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const creditCardApi = {
  /**
   * クレジットカード情報を取得
   */
  getCreditCard: async () => {
    const response = await apiClient.get<{
      data: CreditCardResponse | null;
      message?: string;
    }>("/credit-card");
    return response.data;
  },

  /**
   * クレジットカードを登録・更新
   */
  saveCreditCard: async (data: CreditCardData) => {
    const response = await apiClient.post<{
      data: CreditCardResponse;
      message: string;
    }>("/credit-card", data);
    return response.data;
  },

  /**
   * クレジットカードを削除
   */
  deleteCreditCard: async () => {
    const response = await apiClient.delete<{
      message: string;
    }>("/credit-card");
    return response.data;
  },
};
