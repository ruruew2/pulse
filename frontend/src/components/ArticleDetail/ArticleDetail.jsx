import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom'; // useParams 추가
import './ArticleDetail.css';
import { supabase } from '../../supabaseClient';

const ArticleDetail = () => {
  const { id } = useParams(); // URL의 :id 값을 가져옴
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // 1. 데이터 상태 관리 (넘겨받은 데이터가 있으면 우선 사용)
  const [article, setArticle] = useState(state?.data || null);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(!state?.data); // 넘겨받은 데이터 없으면 로딩 시작

  useEffect(() => {
    window.scrollTo(0, 0);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. 만약 넘겨받은 데이터(RSS)가 없고 ID만 있다면 Supabase에서 가져오기
    if (!article && id) {
      fetchPublishedArticle();
    }
  }, [id]);

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

  // 좋아요/북마크 체크 로직 (동일)
  useEffect(() => {
    if (!user || !article) return;
    // ... 기존 좋아요/북마크 체크 코드와 동일하게 유지 ...
  }, [user, article]);

  if (loading) return <div className="loading">LOADING...</div>;
  if (!article) return <div className="error-msg">기사를 찾을 수 없습니다.</div>;

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>

      <header className="detail-header">
        <div className="detail-category">#{article.category || 'TECH'}</div>
        <h1 className="detail-title">{article.title}</h1>
        <div className="detail-meta">
          <span>PULSE EDITORIAL</span>
          <span> · </span>
          <span>{article.created_at?.split('T')[0] || article.publishedAt?.split(' ')[0]}</span>
        </div>
      </header>

      {/* 이미지가 있을 때만 노출 (발행 기사는 본문에 이미지가 포함됨) */}
      {article.image && (
        <div className="detail-hero-img">
          <img src={article.image} alt={article.title} />
        </div>
      )}

      <main className="detail-content">
        <div className="action-buttons">
           {/* 좋아요/북마크 버튼 유지 */}
        </div>

        {/* 직접 발행한 기사라면 에디터 내용을 HTML로 렌더링 */}
        {article.content ? (
          <div className="full-text ql-editor" dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : (
          /* RSS 기사라면 기존 요약본 노출 */
          <>
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
          </>
        )}
      </main>
    </div>
  );
};

export default ArticleDetail;