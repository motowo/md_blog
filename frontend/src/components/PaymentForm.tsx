import React, { useState } from "react";
import { PaymentData } from "../api/payment";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Alert from "./Alert";

interface PaymentFormProps {
  articleId: number;
  price: number;
  onSubmit: (data: PaymentData) => Promise<void>;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  articleId,
  price,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<PaymentData>({
    article_id: articleId,
    card_number: "",
    card_name: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // カード番号は数字のみ、最大16桁
    if (name === "card_number") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 16) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
      return;
    }

    // 有効期限（月）は2桁の数字
    if (name === "expiry_month") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 2) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
      return;
    }

    // 有効期限（年）は4桁の数字
    if (name === "expiry_year") {
      const numbersOnly = value.replace(/\D/g, "");
      if (numbersOnly.length <= 4) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
      return;
    }

    // CVVは3桁の数字
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

    if (formData.card_number.length !== 16) {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // カード番号を4桁ごとに区切って表示
  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})(?=\d)/g, "$1-");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          ¥{price.toLocaleString()}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          記事の購入金額
        </p>
      </div>

      <Alert variant="info" className="mb-6">
        <p className="font-semibold mb-2">テスト用カード番号</p>
        <ul className="text-sm space-y-1">
          <li>成功: 4242-4242-4242-4242</li>
          <li>失敗: 4000-0000-0000-0002</li>
          <li>残高不足: 4000-0000-0000-9995</li>
        </ul>
      </Alert>

      <div>
        <label htmlFor="card_number" className="block text-sm font-medium mb-2">
          カード番号
        </label>
        <Input
          id="card_number"
          name="card_number"
          type="text"
          placeholder="1234 5678 9012 3456"
          value={formatCardNumber(formData.card_number)}
          onChange={handleChange}
          error={errors.card_number}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="card_name" className="block text-sm font-medium mb-2">
          カード名義人
        </label>
        <Input
          id="card_name"
          name="card_name"
          type="text"
          placeholder="TARO YAMADA"
          value={formData.card_name}
          onChange={handleChange}
          error={errors.card_name}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium mb-2">
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
              error={errors.expiry_month}
              disabled={isSubmitting}
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
              error={errors.expiry_year}
              disabled={isSubmitting}
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
            error={errors.cvv}
            disabled={isSubmitting}
            className="w-24"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "処理中..." : "購入する"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
