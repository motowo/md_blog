import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Alert from "./Alert";
import { Card, CardBody, CardHeader } from "./ui/Card";
import { paymentApi } from "../api/payment";
import { creditCardApi } from "../api/creditCard";
import type { PaymentData } from "../api/payment";
import type { CreditCardResponse } from "../api/creditCard";
import type { Article } from "../types/article";
import { formatCurrency } from "../utils/currency";

interface PaidArticleAccessModalProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
  isLoggedIn: boolean;
}

export const PaidArticleAccessModal: React.FC<PaidArticleAccessModalProps> = ({
  article,
  isOpen,
  onClose,
  onPurchaseSuccess,
  isLoggedIn,
}) => {
  const navigate = useNavigate();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [creditCard, setCreditCard] = useState<CreditCardResponse | null>(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [cvv, setCvv] = useState("");
  const [cvvError, setCvvError] = useState("");

  // 登録済みカード情報を取得
  useEffect(() => {
    if (isOpen && isLoggedIn) {
      setLoadingCard(true);
      creditCardApi
        .getCreditCard()
        .then((response) => {
          setCreditCard(response.data);
        })
        .catch((error) => {
          console.error("Failed to fetch credit card:", error);
        })
        .finally(() => {
          setLoadingCard(false);
        });
    }
  }, [isOpen, isLoggedIn]);

  // モーダルが閉じたときの状態リセット
  useEffect(() => {
    if (!isOpen) {
      setCvv("");
      setCvvError("");
      setPaymentError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    onClose();
    navigate("/login", {
      state: {
        from: `/articles/${article.id}`,
        message: "ログイン後、記事を購入できます",
      },
    });
  };

  const handleSavedCardPurchase = async () => {
    if (!creditCard) return;

    // CVVの検証
    if (!cvv || cvv.length !== 3) {
      setCvvError("CVVを3桁で入力してください");
      return;
    }

    setPaymentError(null);
    setCvvError("");

    try {
      await paymentApi.purchaseArticle({
        article_id: article.id,
        use_saved_card: true,
        cvv: cvv,
      } as PaymentData & { use_saved_card: boolean });

      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string; errors?: Record<string, string[]> };
          };
        };
        if (axiosError.response?.data?.errors?.card) {
          setPaymentError(axiosError.response.data.errors.card[0]);
        } else if (axiosError.response?.data?.message) {
          setPaymentError(axiosError.response.data.message);
        } else {
          setPaymentError("決済処理中にエラーが発生しました");
        }
      } else {
        setPaymentError("決済処理中にエラーが発生しました");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                有料記事
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </CardHeader>

          <CardBody>
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {article.title}
              </h3>

              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(article.price || 0)}
              </div>

              {!isLoggedIn ? (
                // 未ログインユーザー向け
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200 mb-2 font-medium">
                      この記事は有料コンテンツです
                    </p>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      続きを読むには、ログインしてから記事を購入してください。
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      onClick={handleLoginRedirect}
                      className="w-full"
                    >
                      ログインして購入する
                    </Button>

                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="w-full"
                    >
                      キャンセル
                    </Button>
                  </div>
                </>
              ) : (
                // ログイン済みユーザー向け
                <>
                  {loadingCard ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : creditCard ? (
                    // 登録済みカードがある場合
                    <>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <p className="text-green-800 dark:text-green-200 font-medium mb-2">
                          登録済みのカードで支払う
                        </p>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          <p className="font-medium">
                            {creditCard.masked_card_number}
                          </p>
                          <p>{creditCard.card_name}</p>
                        </div>
                      </div>

                      {paymentError && (
                        <Alert variant="error">{paymentError}</Alert>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="modal-cvv"
                            className="block text-sm font-medium mb-2"
                          >
                            CVV（セキュリティコード）
                          </label>
                          <Input
                            id="modal-cvv"
                            type="text"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 3) {
                                setCvv(value);
                                setCvvError("");
                              }
                            }}
                            error={cvvError}
                            className="w-24"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            onClick={handleSavedCardPurchase}
                            className="flex-1"
                          >
                            購入する
                          </Button>
                          <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                          >
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    // カードが登録されていない場合
                    <>
                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                        <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">
                          支払い方法が登録されていません
                        </p>
                        <p className="text-amber-700 dark:text-amber-300 text-sm">
                          記事を購入するには、まず支払い方法を登録してください。
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Button
                          variant="primary"
                          onClick={() => {
                            onClose();
                            navigate("/mypage?tab=payment");
                          }}
                          className="w-full"
                        >
                          支払い方法を登録する
                        </Button>

                        <Button
                          variant="outline"
                          onClick={onClose}
                          className="w-full"
                        >
                          キャンセル
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
