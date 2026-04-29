import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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

  useEffect(() => {
    window.scrollTo(0, 0);

    const initPage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!article && id) {
        await fetchAnyArticle(id);
      } else if (article && id) {
        // 이미 데이터가 있는 경우 (state 전달)
        const tableName = article.content ? 'newsletters' : 'articles';
        incrementView(id, tableName);
        if (currentUser) checkUserStatus(currentUser.id, id);
      }
    };

    initPage();
  }, [id]);

  const handleBack = () => {
  if (!state) {
    navigate('/'); 
  } else {
    navigate(-1);
  }
};

  const fetchAnyArticle = async (articleId) => {
    setLoading(true);
    try {
      // 1. newsletters 테이블 먼저 확인
      let { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', articleId)
        .single();

      let currentTable = 'newsletters';

      // 2. 없으면 articles 테이블 확인
      if (!data) {
        const { data: rssData } = await supabase
          .from('articles')
          .select('*')
          .eq('id', articleId)
          .single();
        
        data = rssData;
        currentTable = 'articles';
      }

      if (!data) throw new Error("기사를 찾을 수 없습니다.");

      setArticle(data);
      incrementView(articleId, currentTable);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) checkUserStatus(session.user.id, articleId);

    } catch (err) {
      console.error("데이터 로드 실패:", err.message);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  const incrementView = async (articleId, tableName) => {
    try {
      const { data } = await supabase.from(tableName).select('views').eq('id', articleId).single();
      if (data) {
        await supabase.from(tableName).update({ views: (data.views || 0) + 1 }).eq('id', articleId);
      }
    } catch (e) { console.error("조회수 증가 실패"); }
  };

  const checkUserStatus = async (userId, articleId) => {
    try {
      const { data: L } = await supabase.from('likes').select('*').eq('user_id', userId).eq('article_id', articleId).maybeSingle();
      if (L) setLiked(true);
      const { data: B } = await supabase.from('bookmarks').select('*').eq('user_id', userId).eq('article_id', articleId).maybeSingle();
      if (B) setBookmarked(true);
    } catch (e) { console.error("상태 확인 실패"); }
  };

  const handleLike = async () => {
    if (!user) return alert("로그인 후 이용 가능합니다!");
    const source = article.content ? 'newsletter' : 'rss';
    if (liked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('article_id', id);
      setLiked(false);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, article_id: id, source });
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
  if (!article) return <div className="error-msg">기사를 찾을 수 없습니다.</div>;

  // 날짜 포맷팅 안전 장치
  const displayDate = (article.created_at || article.publishedAt || article.published_at || '').split(/[ T]/)[0];

  return (
    <div className="detail-container">
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
              <p>
                현재 이 기사는 외부 매체(RSS)를 통해 큐레이션된 콘텐츠입니다.
                PULSE는 독자분들께 가장 핵심적인 인사이트를 빠르게 전달하기 위해 요약된 정보를 제공하고 있습니다.
              </p>
              <p style={{ marginTop: '20px' }}>
                전체 기사 내용과 상세한 이미지는 아래 <b>'READ FULL ARTICLE'</b> 버튼을 통해 원문 사이트에서 확인하실 수 있습니다.
              </p>
              <a href={article.url} target="_blank" rel="noreferrer" className="read-more-btn">READ FULL ARTICLE →</a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ArticleDetail;