import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Account from './components/Account';
import BookSearch from './components/BookSearch'; // 👈 追加

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 1. アプリ起動時にセッション情報を確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. 認証状態の変化を監視（ログイン/ログアウト時）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // クリーンアップ関数: コンポーネントが破棄されるときに監視を停止
    return () => subscription.unsubscribe();
  }, []); // 依存配列が空なので、マウント時に一度だけ実行

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? (
        // ログインしていない場合
        <Auth />
      ) : (
        // ログインしている場合
        <>
          <Account />
          <BookSearch session={session} /> 
        </>
      )}
    </div>
  );
}

export default App;
