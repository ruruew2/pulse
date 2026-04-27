import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabaseClient";
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [likes, setLikes] = useState([]);
  const [tab, setTab] = useState('bookmark');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);
      fetchBookmarks(session.user.id);
      fetchLikes(session.user.id);
    });
  }, []);

  const fetchBookmarks = async (userId) => {
    const { data } = await supabase
      .from('bookmarks')
      .select('article_id, articles(*)')
      .eq('user_id', userId);
    setBookmarks(data?.map(d => d.articles) || []);
  };

  const fetchLikes = async (userId) => {
    const { data } = await supabase
      .from('likes')
      .select('article_id, articles(*)')
      .eq('user_id', userId);
    setLikes(data?.map(d => d.articles) || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const currentList = tab === 'bookmark' ? bookmarks : likes;

  return (
    <div className="mypage-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>

      <header className="mypage-header">
        <h1 className="mypage-title">MY PAGE</h1>
        <div className="mypage-user">
          <span>{user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">로그아웃</button>
        </div>
      </header>

      <div className="mypage-tabs">
        <button 
          className={tab === 'bookmark' ? 'tab active' : 'tab'} 
          onClick={() => setTab('bookmark')}
        >
          ★ 북마크 {bookmarks.length}
        </button>
        <button 
          className={tab === 'like' ? 'tab active' : 'tab'} 
          onClick={() => setTab('like')}
        >
          ♥ 좋아요 {likes.length}
        </button>
      </div>

      <div className="mypage-list">
        {currentList.length === 0 ? (
          <p className="empty-msg">아직 {tab === 'bookmark' ? '북마크한' : '좋아요한'} 기사가 없습니다.</p>
        ) : (
          currentList.map((article, idx) => (
            <div 
              key={idx} 
              className="mypage-card"
              onClick={() => navigate(`/article/${article.id}`, { state: { data: article } })}
            >
              <div className="mypage-card-img">
                <img src={article.image || `https://picsum.photos/seed/${idx}/400/300`} alt="" />
              </div>
              <div className="mypage-card-info">
                <span className="mypage-card-cat">{article.category}</span>
                <h3>{article.title}</h3>
                <span className="mypage-card-date">{article.published_at?.split(' ')[0]}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPage;