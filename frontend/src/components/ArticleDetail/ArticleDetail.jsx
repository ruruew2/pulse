import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './ArticleDetail.css';
import { supabase } from '../../supabaseClient';

const ArticleDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // 1. 상태 관리
  const [article, setArticle] = useState(state?.data || null);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(!state?.data);

  // 현재 경로가 /post/로 시작하는지 확인 (초기값)
  const isPostPath = window.location.pathname.startsWith('/post/');

  useEffect(() => {
    window.scrollTo(0, 0);

    const initPage = async () => {
      // 유저 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // 데이터가 없으면 DB에서 가져오기
      if (!article && id) {
        await fetchAnyArticle(id);
      } else if (article) {
        // 이미 데이터가 있다면 조회수만 증가
        incrementView(id, article.content ? 'newsletters' : 'rss_articles');
        if (session?.user) checkUserStatus(session.user.id, id);
      }
    };

    initPage();
  }, [id]);

  // [핵심 수정] 어떤 테이블에 있는지 모를 때 양쪽 다 찾아보는 로직
  const fetchAnyArticle = async (articleId) => {
    setLoading(true);
    try {
      // 1. 먼저 발행글(newsletters) 테이블 확인
      let { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', articleId)
        .single();

      let currentTable = 'newsletters';

      // 2. 발행글에 없으면 RSS 테이블 확인
      if (!data) {
        const { data: rssData } = await supabase
          .from('rss_articles') // 실제 테이블명 확인 필요!
          .select('*')
          .eq('id', articleId)
          .single();
        
        data = rssData;
        currentTable = 'rss_articles';
      }

      if (!data) throw new Error("Article not found in any table");

      setArticle(data);
      
      // 데이터 찾은 후 부가 기능 실행
      incrementView(articleId, currentTable);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) checkUserStatus(session.user.id, articleId);

    } catch (err) {
      console.error("데이터 로드 최종 실패:", err.message);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const incrementView = async (articleId, tableName) => {
    try {
      const { data } = await supabase.from(tableName).select('views').eq('id', articleId).single();
      await supabase.from(tableName).update({ views: (data?.views || 0) + 1 }).eq('id', articleId);
    } catch (e) { console.error("조회수 증가 실패"); }
  };

  const checkUserStatus = async (userId, articleId) => {
    const { data: L } = await supabase.from('likes').select('*').eq('user_id', userId).eq('article_id', articleId).single();
    if (L) setLiked(true);
    const { data: B } = await supabase.from('bookmarks').select('*').eq('user_id', userId).eq('article_id', articleId).single();
    if (B) setBookmarked(true);
  };

  const handleLike = async () => {
    if (!user) return alert("로그인 후 이용 가능합니다!");
    const table = 'likes';
    const source = article.content ? 'newsletter' : 'rss';
    if (liked) {
      await supabase.from(table).delete().eq('user_id', user.id).eq('article_id', id);
      setLiked(false);
    } else {
      await supabase.from(table).insert({ user_id: user.id, article_id: id, source });
      setLiked(true);
    }
  };

  const handleBookmark = async () => {
    if (!user) return alert("로그인 후 이용 가능합니다!");
    const source = article.content ? 'newsletter' : 'rss';
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('article_id', id);
      setBookmarked(false);
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, article_id: id, source });
      setBookmarked(true);
    }
  };

  const handleShare = () => {
    const url = article?.content 
      ? `${window.location.origin}/post/${id}` 
      : `${window.location.origin}/article/${id}`;
    navigator.clipboard.writeText(url);
    alert('링크가 복사되었습니다! 🔗');
  };

  if (loading) return <div className="loading">LOADING...</div>;
  if (!article) return <div className="error-msg">기사를 찾을 수 없습니다. 주소를 확인해주세요.</div>;

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>
      <header className="detail-header">
        <div className="detail-category">#{article.category || 'NEWS'}</div>
        <h1 className="detail-title">{article.title}</h1>
        <div className="detail-meta">
          <span>PULSE EDITORIAL</span> · <span>{article.created_at?.split('T')[0] || article.publishedAt?.split(' ')[0]}</span> · <span>👁 {article.views || 0}</span>
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
            <a href={article.url} target="_blank" rel="noreferrer" className="read-more-btn">READ FULL ARTICLE →</a>
          </div>
        )}
      </main>
    </div>
  );
};

export default ArticleDetail;