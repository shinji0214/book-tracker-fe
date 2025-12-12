import { supabase } from '../supabaseClient';

export default function Account() {
  const handleLogout = async () => {
    // SupabaseのsignOutメソッドでセッションを破棄
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
    }
    // App.tsxのonAuthStateChangeが検知し、画面がAuthに切り替わる
  };

  return (
    <div className="form-widget">
      <p>ログイン済みです。</p>
      <button className="button block" onClick={handleLogout}>
        ログアウト
      </button>
    </div>
  );
}