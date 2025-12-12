import { createClient } from '@supabase/supabase-js';

// 環境変数から値を取得
// VITE_ で始まる環境変数は、Viteによってクライアントサイドに公開されます。
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// APIキーがない場合はエラーを出す
if (!supabaseUrl || !supabaseAnonKey) {
  // アプリケーション実行を停止し、設定ミスを開発者に通知します。
  throw new Error("Supabase environment variables are missing.");
}

// Supabaseクライアントのインスタンスを作成・エクスポート
// RLSを適用する anon public キーを使用します。
export const supabase = createClient(supabaseUrl, supabaseAnonKey);