import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { formatCurrency } from '../utils/currency';
import { salesApi, type Payout, type PayoutSummary, type PayoutScheduleItem } from '../api/sales';
import Alert from '../components/Alert';
import { getBadgeClass } from '../constants/badgeStyles';

const PayoutManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'schedule'>('history');
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutSchedule, setPayoutSchedule] = useState<PayoutScheduleItem[]>([]);
  const [carryOverBalance, setCarryOverBalance] = useState(0);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchPayouts();
    } else {
      fetchPayoutSchedule();
    }
  }, [activeTab]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await salesApi.getPayouts();
      setPayouts(response.data.data);
      setSummary(response.summary);
    } catch (err) {
      setError('振込履歴の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutSchedule = async () => {
    try {
      setLoading(true);
      const response = await salesApi.getPayoutSchedule();
      setPayoutSchedule(response.data);
      setCarryOverBalance(response.carry_over_balance);
    } catch (err) {
      setError('振込予定の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatMonth = (period: string) => {
    const [year, month] = period.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      paid: '振込済',
      unpaid: '未振込',
      failed: '失敗',
      scheduled: '振込予定',
      carry_over: '繰越',
    };
    
    return (
      <span className={getBadgeClass('paymentStatus', status as any)}>
        {statusMap[status] || status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">売上入金管理</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          月次の振込状況と予定を確認できます
        </p>
      </div>

      {error && (
        <Alert variant="error" closable onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 振込ルール説明 */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white mb-1">振込ルール</p>
              <ul className="list-disc list-inside space-y-1">
                <li>毎月末締め、翌月15日振込（15日が土日祝日の場合は前営業日）</li>
                <li>振込額が1,000円未満の場合は翌月に繰越</li>
                <li>繰越分を含めて1,000円以上になった時点で振込対象となります</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            振込履歴
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            振込予定
          </button>
        </nav>
      </div>

      {/* 集計情報（振込履歴タブのみ） */}
      {activeTab === 'history' && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">総振込額</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(summary.total_net)}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                （総売上 {formatCurrency(summary.total_gross)} - 手数料 {formatCurrency(summary.total_commission)}）
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">振込済み金額</div>
              <div className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(summary.total_paid)}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">未振込金額</div>
              <div className="mt-1 text-2xl font-semibold text-orange-600 dark:text-orange-400">
                {formatCurrency(summary.pending_amount)}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* コンテンツ */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab === 'history' ? '振込履歴' : '振込予定'}
          </h2>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === 'history' ? (
            // 振込履歴
            payouts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  振込履歴がありません
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  振込が実行されると、ここに履歴が表示されます
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        対象月
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        売上金額
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        手数料
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        振込金額
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        振込日
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {payouts.map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatMonth(payout.period)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                          {formatCurrency(parseFloat(payout.gross_amount))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
                          -{formatCurrency(parseFloat(payout.commission_amount))}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                            ({payout.commission_rate}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(parseFloat(payout.amount))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                          {getStatusBadge(payout.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(payout.paid_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            // 振込予定
            <>
              {payoutSchedule.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    振込予定がありません
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    未振込の売上がある場合、ここに振込予定が表示されます
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            対象月
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            当月売上
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            繰越金額
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            合計金額
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            ステータス
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            振込予定日
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {payoutSchedule.map((schedule, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatMonth(schedule.period)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                              {formatCurrency(schedule.payout_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                              {formatCurrency(schedule.carry_over_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                              {formatCurrency(schedule.total_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                              {getStatusBadge(schedule.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatDate(schedule.scheduled_date)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {carryOverBalance > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            繰越残高: {formatCurrency(carryOverBalance)}
                          </p>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            1,000円未満のため、次回の売上と合算されます
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default PayoutManagement;