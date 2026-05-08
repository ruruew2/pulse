import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom'; // ✅ 필수!
import './ArticleDetail.css';
import { supabase } from '../../supabaseClient';

const ArticleDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [article, setArticle] = useState(state?.data || null);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(!state?.data);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 1. 스크롤 진행도 계산
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. 초기 데이터 로드
  useEffect(() => {
    window.scrollTo(0, 0);
    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!article && id) {
        await fetchAnyArticle(id);
      } else if (article && id) {
        const tableName = article.content ? 'newsletters' : 'articles';
        incrementView(id, tableName);
        if (currentUser) checkUserStatus(currentUser.id, id);
      }
    };
    initPage();
  }, [id]);

  const fetchAnyArticle = async (articleId) => {
    setLoading(true);
    try {
      let { data } = await supabase.from('newsletters').select('*').eq('id', articleId).single();
      let currentTable = 'newsletters';
      if (!data) {
        const { data: rssData } = await supabase.from('articles').select('*').eq('id', articleId).single();
        data = rssData;
        currentTable = 'articles';
      }
      if (!data) throw new Error("기사를 찾을 수 없습니다.");
      setArticle(data);
      incrementView(articleId, currentTable);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) checkUserStatus(session.user.id, articleId);
    } catch (err) {
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const incrementView = async (articleId, tableName) => {
    try {
      const { data } = await supabase.from(tableName).select('views').eq('id', articleId).single();
      if (data) await supabase.from(tableName).update({ views: (data.views || 0) + 1 }).eq('id', articleId);
    } catch (e) {}
  };

  const checkUserStatus = async (userId, articleId) => {
    try {
      const { data: L } = await supabase.from('likes').select('*').eq('user_id', userId).eq('article_id', articleId).maybeSingle();
      if (L) setLiked(true);
      const { data: B } = await supabase.from('bookmarks').select('*').eq('user_id', userId).eq('article_id', articleId).maybeSingle();
      if (B) setBookmarked(true);
    } catch (e) {}
  };

  const handleLike = async () => {
    if (!user) return alert("로그인 후 이용 가능합니다!");
    if (liked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('article_id', id);
      setLiked(false);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, article_id: id, source: article.content ? 'newsletter' : 'rss' });
      setLiked(true);
    }
  };

  const handleBookmark = async () => {
    if (!user) return alert("로그인 후 이용 가능합니다!");
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('article_id', id);
      setBookmarked(false);
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, article_id: id, source: article.content ? 'newsletter' : 'rss' });
      setBookmarked(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다! 🔗');
  };

  if (loading) return <div className="loading">LOADING...</div>;
  if (!article) return <div className="error-msg">기사를 찾을 수 없습니다.</div>;

  const displayDate = (article.created_at || article.publishedAt || '').split(/[ T]/)[0];

  return (
    <>
      {createPortal(
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          width: `${scrollProgress}%`,
          height: '3px',
          backgroundColor: '#3a3a3a',
          zIndex: 99999,
          transition: 'width 0.15s linear',
          pointerEvents: 'none'
        }} />,
        document.body
      )}

      <div className="detail-container">
        <nav className="detail-nav">
          <div className="nav-logo" onClick={() => navigate('/')}>PULSE</div>
        </nav>

        <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>
        
        <header className="detail-header">
          <div className="detail-category">#{article.category || 'NEWS'}</div>
          <h1 className="detail-title">{article.title}</h1>
          <div className="detail-meta">
            <span>PULSE EDITORIAL</span> · <span>{displayDate}</span> · <span>👁 {article.views || 0} views</span>
          </div>
        </header>

        {article.image && <div className="detail-hero-img"><img src={article.image} alt="" /></div>}

        <main className="detail-content">
          <div className="action-buttons">
            <button className={`action-btn ${liked ? 'active' : ''}`} onClick={handleLike}>{liked ? '❤️' : '♡'}</button>
            <button className={`action-btn ${bookmarked ? 'active' : ''}`} onClick={handleBookmark}>{bookmarked ? '🔖' : '☆'}</button>
            <button className="action-btn" onClick={handleShare}>⎋</button>
          </div>

          {article.content ? (
            <div className="full-text ql-editor" dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <div className="rss-summary-container">
              <blockquote className="ai-summary">
                <span className="summary-label">AI SUMMARY</span>
                <p>{article.summary || '내용 요약 중입니다...'}</p>
              </blockquote>
              <div className="full-text">
                <p>현재 이 기사는 외부 매체(RSS)를 통해 큐레이션된 콘텐츠입니다.</p>
                <a href={article.url} target="_blank" rel="noreferrer" className="read-more-btn">READ FULL ARTICLE →</a>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ArticleDetail;