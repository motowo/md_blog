import React, { useState, useEffect } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { Card, CardBody, CardHeader } from "./ui/Card";
import Alert from "./Alert";
import { creditCardApi } from "../api/creditCard";
import type { CreditCardData, CreditCardResponse } from "../api/creditCard";

interface CreditCardManagerProps {
  onUpdate?: () => void;
}

export const CreditCardManager: React.FC<CreditCardManagerProps> = ({
  onUpdate,
}) => {
  const [creditCard, setCreditCard] = useState<CreditCardResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreditCardData>({
    card_number: "",
    card_name: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // クレジットカード情報を取得
  const fetchCreditCard = async () => {
    try {
      setLoading(true);
      const response = await creditCardApi.getCreditCard();
      setCreditCard(response.data);

      if (response.data) {
        // 既存のカード情報がある場合、有効期限は編集可能にする
        setFormData({
          card_number: "",
          card_name: response.data.card_name,
          expiry_month: response.data.expiry_month,
          expiry_year: response.data.expiry_year,
          cvv: "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch credit card:", error);
      setError("クレジットカード情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditCard();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "card_number") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 16) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
      return;
    }

    if (name === "expiry_month") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 2) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
      return;
    }

    if (name === "expiry_year") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 4) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
      return;
    }

    if (name === "cvv") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 3) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.card_number || formData.card_number.length !== 16) {
      newErrors.card_number = "カード番号は16桁で入力してください";
    }

    if (!formData.card_name.trim()) {
      newErrors.card_name = "カード名義人を入力してください";
    }

    if (formData.expiry_month.length !== 2) {
      newErrors.expiry_month = "月は2桁で入力してください";
    } else {
      const month = parseInt(formData.expiry_month);
      if (month < 1 || month > 12) {
        newErrors.expiry_month = "有効な月を入力してください（01-12）";
      }
    }

    if (formData.expiry_year.length !== 4) {
      newErrors.expiry_year = "年は4桁で入力してください";
    } else {
      const year = parseInt(formData.expiry_year);
      const currentYear = new Date().getFullYear();
      if (year < currentYear) {
        newErrors.expiry_year = "有効期限が過ぎています";
      }
    }

    if (formData.cvv.length !== 3) {
      newErrors.cvv = "CVVは3桁で入力してください";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await creditCardApi.saveCreditCard(formData);
      setSuccess("クレジットカードを登録しました");
      setIsEditing(false);
      await fetchCreditCard();
      if (onUpdate) onUpdate();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              errors?: Record<string, string | string[]>;
              message?: string;
            };
          };
        };
        if (axiosError.response?.data?.errors) {
          const firstError = Object.values(axiosError.response.data.errors)[0];
          setError(
            Array.isArray(firstError) ? firstError[0] : String(firstError),
          );
        } else {
          setError(axiosError.response?.data?.message || "登録に失敗しました");
        }
      } else {
        setError("登録に失敗しました");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("クレジットカードを削除してもよろしいですか？")) {
      return;
    }

    setDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      await creditCardApi.deleteCreditCard();
      setSuccess("クレジットカードを削除しました");
      setCreditCard(null);
      setFormData({
        card_number: "",
        card_name: "",
        expiry_month: "",
        expiry_year: "",
        cvv: "",
      });
      if (onUpdate) onUpdate();
    } catch (error: unknown) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
        setError(axiosError.response?.data?.message || "削除に失敗しました");
      } else {
        setError("削除に失敗しました");
      }
    } finally {
      setDeleting(false);
    }
  };

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})(?=\d)/g, "$1-");
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              読み込み中...
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            支払い方法
          </h3>
          {creditCard && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              編集
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        {!creditCard || isEditing ? (
          // カード登録・編集フォーム
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="card_number"
                className="block text-sm font-medium mb-2"
              >
                カード番号
              </label>
              <Input
                id="card_number"
                name="card_number"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(formData.card_number)}
                onChange={handleChange}
                error={formErrors.card_number}
                disabled={saving}
              />
            </div>

            <div>
              <label
                htmlFor="card_name"
                className="block text-sm font-medium mb-2"
              >
                カード名義人
              </label>
              <Input
                id="card_name"
                name="card_name"
                type="text"
                placeholder="TARO YAMADA"
                value={formData.card_name}
                onChange={handleChange}
                error={formErrors.card_name}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="expiry"
                  className="block text-sm font-medium mb-2"
                >
                  有効期限
                </label>
                <div className="flex gap-2">
                  <Input
                    id="expiry_month"
                    name="expiry_month"
                    type="text"
                    placeholder="MM"
                    value={formData.expiry_month}
                    onChange={handleChange}
                    error={formErrors.expiry_month}
                    disabled={saving}
                    className="w-20"
                  />
                  <span className="self-center">/</span>
                  <Input
                    id="expiry_year"
                    name="expiry_year"
                    type="text"
                    placeholder="YYYY"
                    value={formData.expiry_year}
                    onChange={handleChange}
                    error={formErrors.expiry_year}
                    disabled={saving}
                    className="w-24"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium mb-2">
                  CVV
                </label>
                <Input
                  id="cvv"
                  name="cvv"
                  type="text"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={handleChange}
                  error={formErrors.cvv}
                  disabled={saving}
                  className="w-24"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "保存中..." : creditCard ? "更新する" : "登録する"}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormErrors({});
                  }}
                  disabled={saving}
                >
                  キャンセル
                </Button>
              )}
            </div>
          </form>
        ) : (
          // 登録済みカード表示
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {creditCard.card_brand}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  登録日:{" "}
                  {new Date(creditCard.created_at).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {creditCard.masked_card_number}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {creditCard.card_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                有効期限: {creditCard.expiry_month}/{creditCard.expiry_year}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              {deleting ? "削除中..." : "カードを削除"}
            </Button>
          </div>
        )}

        {!creditCard && !isEditing && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              支払い方法が登録されていません
            </p>
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              クレジットカードを登録
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
