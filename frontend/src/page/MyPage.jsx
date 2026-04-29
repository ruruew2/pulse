import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "../supabaseClient";
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [likes, setLikes] = useState([]);
  const [tab, setTab] = useState('bookmark');
  const [showSettings, setShowSettings] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = localStorage.getItem('pulse_categories');
    return saved ? JSON.parse(saved) : ['IT / TECH', 'DESIGN', 'TREND'];
  });

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
    .select('article_id')
    .eq('user_id', userId);
  
  if (data && data.length > 0) {
    const ids = data.map(d => d.article_id);
    const { data: articleData } = await supabase
      .from('articles')
      .select('*')
      .in('id', ids);
    setBookmarks(articleData || []);
  }
};

const fetchLikes = async (userId) => {
  const { data } = await supabase
    .from('likes')
    .select('article_id')  
    .eq('user_id', userId);
    
  if (data && data.length > 0) {
    const ids = data.map(d => d.article_id);
    const { data: articleData } = await supabase
      .from('articles')
      .select('*')
      .in('id', ids);
    setLikes(articleData || []);
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPwMsg('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPwMsg('변경 실패: ' + error.message);
    else {
      setPwMsg('비밀번호가 변경되었습니다!');
      setNewPassword('');
    }
  };

  const toggleCategory = (cat) => {
    const updated = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(updated);
    localStorage.setItem('pulse_categories', JSON.stringify(updated));
  };

  const currentList = tab === 'bookmark' ? bookmarks : likes;

  return (
    <div className="mypage-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>

      <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>⚙</button>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="settings-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="settings-panel-header">
              <h3>설정</h3>
              <button className="settings-close-btn" onClick={() => setShowSettings(false)}>✕</button>
            </div>

            <div className="settings-item">
              <label>새 비밀번호를 입력해주세요!</label>
              <input
                type="password"
                placeholder="new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="settings-input"
              />
              <button className="settings-save-btn" onClick={handlePasswordChange}>
                변경하기
              </button>
              {pwMsg && <p className="pw-msg">{pwMsg}</p>}
            </div>

            <div className="settings-item">
              <label>관심 카테고리</label>
              {['IT / TECH', 'DESIGN', 'TREND'].map(cat => (
                <div key={cat} className="category-check">
                  <input
                    type="checkbox"
                    id={cat}
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <label htmlFor={cat}>{cat}</label>
                </div>
              ))}
            </div>

            <div className="settings-item">
              <button className="settings-logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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