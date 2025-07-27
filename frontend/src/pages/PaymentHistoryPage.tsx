import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { paymentApi, PaymentHistoryItem } from "../api/payment";
import Button from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import Alert from "../components/Alert";
import { getBadgeClass } from "../constants/badgeStyles";
import { formatCurrency } from "../utils/currency";

const PaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentApi.getPaymentHistory(currentPage);
      setPayments(response.data);
      setTotalPages(response.meta.last_page);
    } catch (err) {
      console.error("Failed to fetch payment history:", err);
      setError("決済履歴の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [currentPage, fetchPaymentHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusLabels = {
      completed: "成功",
      failed: "失敗",
      pending: "保留",
    };

    const label = statusLabels[status as keyof typeof statusLabels];
    if (!label) return null;

    return (
      <span className={getBadgeClass("paymentStatus", status)}>{label}</span>
    );
  };

  const handleArticleNavigation = (articleId: number) => {
    try {
      navigate(`/articles/${articleId}`);
    } catch (error) {
      console.error("記事への遷移に失敗しました:", error);
      // フォールバック: 直接URLで遷移
      window.location.href = `/articles/${articleId}`;
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            読み込み中...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          購入履歴
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          過去に購入した記事の履歴を確認できます
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {payments.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                まだ記事を購入していません
              </p>
              <Link to="/articles">
                <Button variant="primary">記事を探す</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* 購入履歴リスト */}
          <div className="space-y-6 mb-8">
            {payments.map((payment) => (
              <Card key={payment.id} className="overflow-hidden">
                <CardBody className="p-0">
                  <div className="p-6">
                    {/* ヘッダー部分 */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {payment.article.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span>購入日時: {formatDate(payment.paid_at)}</span>
                          <span>•</span>
                          <span>取引ID: {payment.transaction_id}</span>
                          <span>•</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {payment.status === "completed" && (
                        <>
                          <Button
                            variant="primary"
                            size="md"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={() =>
                              handleArticleNavigation(payment.article_id)
                            }
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                            記事を読む
                          </Button>
                          <a
                            href={`/articles/${payment.article_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="md"
                              className="w-full flex items-center justify-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              新しいタブで開く
                            </Button>
                          </a>
                        </>
                      )}

                      {payment.status === "failed" && (
                        <div className="flex-1 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                            決済が失敗しました
                          </p>
                          <p className="text-sm text-red-500 dark:text-red-300">
                            記事へのアクセスはできません
                          </p>
                        </div>
                      )}

                      {payment.status === "pending" && (
                        <div className="flex-1 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                          <p className="text-yellow-600 dark:text-yellow-400 font-medium mb-2">
                            決済処理中
                          </p>
                          <p className="text-sm text-yellow-500 dark:text-yellow-300">
                            処理完了後に記事にアクセスできます
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                前のページ
              </Button>
              <span className="text-gray-600 dark:text-gray-400">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                次のページ
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentHistoryPage;
