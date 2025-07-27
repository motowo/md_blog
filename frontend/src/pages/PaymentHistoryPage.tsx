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
      console.log("購入履歴データ:", response.data);
      response.data.forEach((payment, index) => {
        console.log(`決済 ${index + 1}:`, {
          id: payment.id,
          article_id: payment.article_id,
          article_title: payment.article.title,
          status: payment.status,
          paid_at: payment.paid_at,
        });
      });
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

  const handleArticleNavigation = (articleId: number, method: string) => {
    console.log(`${method}でナビゲーション開始:`, { articleId });
    try {
      navigate(`/articles/${articleId}`);
      console.log(`${method}でナビゲーション実行完了`);
    } catch (error) {
      console.error(`${method}でのナビゲーションエラー:`, error);
    }
  };

  const handleDirectNavigation = (articleId: number) => {
    console.log("window.location.hrefでのナビゲーション開始:", { articleId });
    const targetUrl = `/articles/${articleId}`;
    window.location.href = targetUrl;
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
          <div className="space-y-4 mb-8">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Link
                          to={`/articles/${payment.article_id}`}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 underline-offset-2 hover:underline"
                          onClick={() => {
                            console.log("記事リンククリック:", {
                              articleId: payment.article_id,
                              articleTitle: payment.article.title,
                              linkTo: `/articles/${payment.article_id}`,
                              paymentStatus: payment.status,
                            });
                          }}
                        >
                          {payment.article.title}
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleArticleNavigation(
                              payment.article_id,
                              "プログラマティック",
                            );
                          }}
                          className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                          title="プログラマティックナビゲーションで開く"
                        >
                          [navigate関数]
                        </button>
                        <div className="ml-2">
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>購入日時: {formatDate(payment.paid_at)}</span>
                        <span className="mx-2">・</span>
                        <span>取引ID: {payment.transaction_id}</span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </p>
                      {payment.status === "completed" && (
                        <div className="space-y-1">
                          <Link
                            to={`/articles/${payment.article_id}`}
                            onClick={() => {
                              console.log("記事を読むボタンクリック:", {
                                articleId: payment.article_id,
                                linkTo: `/articles/${payment.article_id}`,
                              });
                            }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              記事を読む
                            </Button>
                          </Link>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() =>
                              handleArticleNavigation(
                                payment.article_id,
                                "ボタン",
                              )
                            }
                          >
                            [navigate関数]
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() =>
                              handleDirectNavigation(payment.article_id)
                            }
                          >
                            [直接移動]
                          </Button>
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
