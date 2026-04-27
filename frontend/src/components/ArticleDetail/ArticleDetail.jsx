import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ArticleDetail.css';
import { supabase } from '../../supabaseClient';

const ArticleDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const article = state?.data;
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  // 기존 좋아요/북마크 상태 불러오기
  useEffect(() => {
    if (!user || !article) return;

    supabase.from('likes')
      .select('id')
      .match({ user_id: user.id, article_id: article.id })
      .then(({ data }) => setLiked(data?.length > 0));

    supabase.from('bookmarks')
      .select('id')
      .match({ user_id: user.id, article_id: article.id })
      .then(({ data }) => setBookmarked(data?.length > 0));
  }, [user, article]);

  const handleLike = async () => {
    if (!user) { navigate('/auth'); return; }
    if (liked) {
      await supabase.from('likes').delete().match({ user_id: user.id, article_id: article.id });
      setLiked(false);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, article_id: article.id });
      setLiked(true);
    }
  };

  const handleBookmark = async () => {
    if (!user) { navigate('/auth'); return; }
    if (bookmarked) {
      await supabase.from('bookmarks').delete().match({ user_id: user.id, article_id: article.id });
      setBookmarked(false);
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, article_id: article.id });
      setBookmarked(true);
    }
  };

  if (!article) return <div>기사를 찾을 수 없습니다.</div>;

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>

      <header className="detail-header">
        <div className="detail-category">#{article.category || 'TECH'}</div>
        <h1 className="detail-title">{article.title}</h1>
        <div className="detail-meta">
          <span>PULSE EDITORIAL</span>
          <span> · </span>
          <span>{article.publishedAt?.split(' ')[0] || '2026.04.27'}</span>
        </div>
      </header>

      <div className="detail-hero-img">
        <img src={article.image} alt={article.title} />
      </div>

      <main className="detail-content">
        {/* 좋아요 / 북마크 버튼 */}
        <div className="action-buttons">
          <button className={`action-btn ${liked ? 'active' : ''}`} onClick={handleLike}>
            {liked ? '♥' : '♡'} 좋아요
          </button>
          <button className={`action-btn ${bookmarked ? 'active' : ''}`} onClick={handleBookmark}>
            {bookmarked ? '★' : '☆'} 북마크
          </button>
        </div>

        <blockquote className="ai-summary">
          <span className="summary-label">AI SUMMARY</span>
          <p>{article.summary || '요약 준비 중입니다.'}</p>
        </blockquote>

        <div className="full-text">
          <p>
            현재 이 기사는 외부 매체(RSS)를 통해 큐레이션된 콘텐츠입니다.
            PULSE는 독자분들께 가장 핵심적인 인사이트를 빠르게 전달하기 위해 요약된 정보를 제공하고 있습니다.
          </p>
          <p style={{ marginTop: '20px' }}>
            전체 기사 내용과 상세한 이미지는 아래 <b>'READ FULL ARTICLE'</b> 버튼을 통해 원문 사이트에서 확인하실 수 있습니다.
          </p>
          <a href={article.url} target="_blank" rel="noreferrer" className="read-more-btn">
            READ FULL ARTICLE →
          </a>
        </div>
      </main>
    </div>
  );
};

export default ArticleDetail;