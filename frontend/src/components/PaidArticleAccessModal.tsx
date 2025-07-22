import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Alert from "./Alert";
import { Card, CardBody, CardHeader } from "./ui/Card";
import PaymentForm from "./PaymentForm";
import { paymentApi } from "../api/payment";
import type { PaymentData } from "../api/payment";
import type { Article } from "../types/article";

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

  const handlePurchaseSubmit = async (paymentData: PaymentData) => {
    setPaymentError(null);
    try {
      await paymentApi.purchaseArticle(paymentData);
      if (onPurchaseSuccess) {
        onPurchaseSuccess();
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          setPaymentError(axiosError.response.data.message);
        } else {
          setPaymentError("決済処理中にエラーが発生しました");
        }
      } else {
        setPaymentError("決済処理中にエラーが発生しました");
      }
      throw error;
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
                ¥{Math.floor(article.price || 0).toLocaleString()}
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
                // ログイン済みユーザー向け - 支払いフォーム表示
                <>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                      記事を購入して続きを読む
                    </p>
                  </div>

                  {paymentError && (
                    <Alert variant="error">{paymentError}</Alert>
                  )}

                  <PaymentForm
                    articleId={article.id}
                    price={article.price || 0}
                    onSubmit={handlePurchaseSubmit}
                    onCancel={onClose}
                  />
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
