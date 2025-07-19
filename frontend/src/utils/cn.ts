// clsxの型定義
type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | undefined
  | null
  | ClassValue[]
  | Record<string, unknown>;

// 動的インポートの代替として、基本的なクラス結合関数を実装
function clsx(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'number' || typeof input === 'bigint') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = clsx(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

// twMergeの簡易実装（Tailwindクラスの競合解決）
function twMerge(input: string): string {
  // 基本的な重複クラス除去
  const classes = input.split(' ').filter(Boolean);
  const uniqueClasses = [...new Set(classes)];
  return uniqueClasses.join(' ');
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
