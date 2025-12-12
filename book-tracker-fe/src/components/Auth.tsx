import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // ページの再読み込みを防ぐ
    setLoading(true);

    // SupabaseのsignInWithOtpメソッドでMagic Linkをリクエスト
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert(error.message);
    } else {
      alert('認証メールを送信しました。メールを確認してください！');
    }
    setLoading(false);
  };

  return (
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">読書アプリ サインイン</h1>
        <p className="description">
          Magic Linkを使ってサインインします。メールアドレスを入力してください。
        </p>
        <form className="form-widget" onSubmit={handleLogin}>
          <div>
            <input
              className="input field"
              type="email"
              placeholder="あなたのメールアドレス"
              value={email}
              required={true}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button className="button block" disabled={loading}>
              {loading ? <span>Loading...</span> : <span>Magic Linkを送信</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}