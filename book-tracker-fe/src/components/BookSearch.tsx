import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

// App.tsx からセッション情報を受け取るための型定義
interface BookSearchProps {
  session: Session;
}

// Google Books APIのベースURL
const API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export default function BookSearch({ session }: BookSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 検索処理
  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearchResults([]);
    
    // 環境変数からAPIキーを取得
    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    // q=${encodeURIComponent(query)}: 検索クエリをURLエンコードして渡す（日本語対応のため重要）
    // &key=${apiKey}: 取得したAPIキーを渡すことで認証を行う
    // &maxResults=10: 取得する結果数を10件に制限
    const url = `${API_BASE_URL}?q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=10`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API呼び出しエラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.items) {
        setSearchResults(data.items);
      } else {
        setError('書籍が見つかりませんでした。');
      }
    } catch (err: any) {
      console.error('検索中にエラーが発生:', err);
      setError(`検索中にエラーが発生しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAdd = async (book: { title: string; author: string; isbn: string; coverUrl: string }) => {
    // ユーザーIDは App.tsx から受け取った session から取得
    const userId = session.user.id;
    console.log("Current User ID:", userId);
    // RLS (Row Level Security) により、このユーザーのデータとして保存されます
    const { data, error } = await supabase
      .from('books')
      .insert({
        user_id: userId,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        cover_image_url: book.coverUrl,
        // status はデフォルト値の 'unread' が使われます
      })
      .select(); // 挿入されたデータを返す

    if (error) {
      alert(`書籍の追加に失敗しました: ${error.message}`);
      console.error('Supabase INSERT Error:', error);
    } else {
      alert(`「${book.title}」を読書記録に追加しました！`);
      console.log('書籍追加成功:', data);
    }
  };

  return (
    <div className="book-search-container">
      <h2>書籍の検索と追加</h2>
      
      <form onSubmit={handleSearch} className="form-widget">
        <input
          type="text"
          placeholder="書籍名または著者名を入力"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="button primary block">
          {loading ? '検索中...' : '検索'}
        </button>
      </form>
      
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      
      <div className="search-results" style={{ marginTop: '20px' }}>
        <h3>検索結果 ({searchResults.length} 件)</h3>
        {searchResults.map((item) => {
          const info = item.volumeInfo;
          // 必要な情報をAPIレスポンスから安全に抽出
          const title = info.title;
          const author = info.authors ? info.authors.join(', ') : '著者不明';
          // ISBN-13を優先して抽出。?. はデータがない場合にエラーにならないようにする（オプショナルチェイニング）
          const isbn = info.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier || 'ISBN不明';
          const coverUrl = info.imageLinks?.thumbnail || 'Placeholder.jpg';
          
          return (
            <div key={item.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <p><strong>タイトル:</strong> {title}</p>
              <p><strong>著者:</strong> {author}</p>
              <p><strong>ISBN:</strong> {isbn}</p>
              <button 
                className="button small"
                // 次のステップで実装
                onClick={() => handleBookAdd({ title, author, isbn, coverUrl })}
              >
                記録に追加
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}