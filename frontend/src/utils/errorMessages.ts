import type { ApiError } from "../types/auth";

// APIエラーメッセージを日本語に変換するマッピング
const errorMessageMap: Record<string, string> = {
  // 認証関連エラー
  "These credentials do not match our records.":
    "メールアドレスまたはパスワードが正しくありません。",
  "The provided credentials are incorrect.":
    "メールアドレスまたはパスワードが正しくありません。",
  "Invalid credentials": "メールアドレスまたはパスワードが正しくありません。",
  "Invalid login credentials":
    "メールアドレスまたはパスワードが正しくありません。",
  "Unauthenticated.": "認証が必要です。",
  Unauthorized: "アクセス権限がありません。",

  // バリデーションエラー
  "The email field is required.": "メールアドレスを入力してください。",
  "The email must be a valid email address.":
    "有効なメールアドレスを入力してください。",
  "The email has already been taken.":
    "このメールアドレスは既に使用されています。",
  "The username field is required.": "ユーザー名を入力してください。",
  "The username has already been taken.":
    "このユーザー名は既に使用されています。",
  "The username must be at least 3 characters.":
    "ユーザー名は3文字以上で入力してください。",
  "The password field is required.": "パスワードを入力してください。",
  "The password must be at least 6 characters.":
    "パスワードは6文字以上で入力してください。",
  "The password confirmation does not match.": "パスワードが一致しません。",
  "The name field is required.": "名前を入力してください。",

  // ネットワークエラー
  "Network Error":
    "ネットワークエラーが発生しました。インターネット接続を確認してください。",
  timeout:
    "リクエストがタイムアウトしました。しばらく後にもう一度お試しください。",
  "Request failed with status code 500":
    "サーバーエラーが発生しました。しばらく後にもう一度お試しください。",
  "Request failed with status code 422": "入力内容に不備があります。",
  "Request failed with status code 429":
    "リクエストが多すぎます。しばらく後にもう一度お試しください。",
};

// フィールド名の日本語マッピング
const fieldNameMap: Record<string, string> = {
  email: "メールアドレス",
  username: "ユーザー名",
  password: "パスワード",
  password_confirmation: "パスワード確認",
  name: "名前",
};

// エラーメッセージを日本語に変換
export const translateErrorMessage = (message: string): string => {
  // 完全一致での変換を試す
  if (errorMessageMap[message]) {
    return errorMessageMap[message];
  }

  // 部分一致での変換を試す
  for (const [englishMsg, japaneseMsg] of Object.entries(errorMessageMap)) {
    if (message.includes(englishMsg) || englishMsg.includes(message)) {
      return japaneseMsg;
    }
  }

  // Laravel バリデーションエラーの形式を処理
  // 例: "The email field is required." -> "メールアドレスを入力してください。"
  const validationPatterns = [
    {
      pattern: /The (\w+) field is required\./,
      template: (field: string) =>
        `${fieldNameMap[field] || field}を入力してください。`,
    },
    {
      pattern: /The (\w+) must be a valid email address\./,
      template: () => "有効なメールアドレスを入力してください。",
    },
    {
      pattern: /The (\w+) has already been taken\./,
      template: (field: string) =>
        `この${fieldNameMap[field] || field}は既に使用されています。`,
    },
    {
      pattern: /The (\w+) must be at least (\d+) characters\./,
      template: (field: string, count: string) =>
        `${fieldNameMap[field] || field}は${count}文字以上で入力してください。`,
    },
  ];

  for (const { pattern, template } of validationPatterns) {
    const match = message.match(pattern);
    if (match) {
      return template(match[1], match[2]);
    }
  }

  // 変換できない場合はそのまま返す
  return message;
};

// APIエラーオブジェクト全体を日本語に変換
export const translateApiError = (error: ApiError): ApiError => {
  const translatedError: ApiError = {
    message: translateErrorMessage(error.message),
    errors: {},
  };

  if (error.errors) {
    translatedError.errors = Object.entries(error.errors).reduce(
      (acc, [field, messages]) => {
        acc[field] = messages.map(translateErrorMessage);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }

  return translatedError;
};
