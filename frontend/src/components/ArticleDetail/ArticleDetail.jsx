import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './ArticleDetail.css';
import { supabase } from '../../supabaseClient';

const ArticleDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // 1. 상태 관리 (넘겨받은 데이터가 있으면 우선 사용)
  const [article, setArticle] = useState(state?.data || null);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(!state?.data);

  // 2. 초기 로드: 유저 세션 확인 + 조회수 업 + 리액션 상태 확인
  useEffect(() => {
    window.scrollTo(0, 0);

    const initPage = async () => {
      // 유저 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 기사 데이터가 없으면 DB에서 가져오기
      if (!article && id) {
        await fetchPublishedArticle();
      }

      // 조회수 1 증가 (DB 업데이트)
      if (id) {
        incrementView(id);
      }

      // 로그인 상태라면 내가 눌렀던 하트/북마크 가져오기
      if (currentUser && id) {
        checkUserStatus(currentUser.id, id);
      }
    };

    initPage();
  }, [id]);

  // [기능] 기사 상세 정보 가져오기
  const fetchPublishedArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      setArticle(data);
    } catch (err) {
      console.error("기사 로드 실패:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // [기능] 조회수 증가 업데이트
  const incrementView = async (articleId) => {
    try {
      const { data } = await supabase
        .from('newsletters')
        .select('views')
        .eq('id', articleId)
        .single();
      
      await supabase
        .from('newsletters')
        .update({ views: (data?.views || 0) + 1 })
        .eq('id', articleId);
    } catch (err) {
      console.error("조회수 업데이트 실패");
    }
  };

  // [기능] 과거 하트/북마크 기록 확인 (나갔다 들어와도 유지되는 핵심!)
  const checkUserStatus = async (userId, articleId) => {
    const { data: likeData } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();
    if (likeData) setLiked(true);

    const { data: bookmarkData } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .eq('article_id', articleId)
      .single();
    if (bookmarkData) setBookmarked(true);
  };

  // [기능] 좋아요 토글
  const handleLike = async () => {
    if (!user) return alert("로그인 후 이용 가능합니다!");
    if (liked) {
      await supabase.from('likes').delete().eq('user_id', user.id).eq('article_id', id);
      setLiked(false);
    } else {
      await supabase.from('likes').insert({ user_id: user.id, article_id: id });
      setLiked(true);
    }
  };

  // [기능] 북마크 토글
  const handleBookmark = async () => {
    if (!user) return alert("로그인 후 이용 가능합니다!");
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('article_id', id);
      setBookmarked(false);
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, article_id: id });
      setBookmarked(true);
    }
  };

  if (loading) return <div className="loading">LOADING CONTENT...</div>;
  if (!article) return <div className="error-msg">기사를 찾을 수 없습니다.</div>;

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>

      <header className="detail-header">
        <div className="detail-category">#{article.category || 'NEWS'}</div>
        <h1 className="detail-title">{article.title}</h1>
        <div className="detail-meta">
          <span>PULSE EDITORIAL</span>
          <span> · </span>
          <span>{article.created_at?.split('T')[0] || article.publishedAt?.split(' ')[0]}</span>
          <span> · </span>
          <span>👁 {article.views || 0} views</span>
        </div>
      </header>

      {article.image && (
        <div className="detail-hero-img">
          <img src={article.image} alt={article.title} />
        </div>
      )}

      <main className="detail-content">
        {/* 리액션 버튼 바 (좋아요, 북마크, 공유) */}
        <div className="action-buttons">
           <button className={`action-btn ${liked ? 'active' : ''}`} onClick={handleLike}>
             {liked ? '❤️' : '♡'}
           </button>
           <button className={`action-btn ${bookmarked ? 'active' : ''}`} onClick={handleBookmark}>
             {bookmarked ? '🔖' : '☆'}
           </button>
           <button className="action-btn" onClick={() => {
             navigator.clipboard.writeText(window.location.href);
             alert('링크가 복사되었습니다! 🔗');
           }}>
             ⎋
           </button>
        </div>

        {/* 직접 발행한 기사 vs RSS 기사 구분 렌더링 */}
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
            <a href={article.url} target="_blank" rel="noreferrer" className="read-more-btn">
              READ FULL ARTICLE →
            </a>
            </div>
          </div>
        )}
      </main>

      <footer className="detail-footer-actions">
        <button className="footer-action-btn share" onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          alert('공유 링크가 복사되었습니다!');
        }}>
        </button>
      </footer>
    </div>
  );
};

export default ArticleDetail;