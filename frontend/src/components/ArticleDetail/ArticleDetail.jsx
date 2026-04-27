import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ArticleDetail.css';


const ArticleDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const article = state?.data;

  // 페이지 진입 시 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!article) return <div>기사를 찾을 수 없습니다.</div>;

  return (
    <div className="detail-container">
      {/* 뒤로가기 버튼 - 시크하게 화살표만 */}
      <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>

      <header className="detail-header">
        <div className="detail-category">#{article.tag || 'TECH'}</div>
        <h1 className="detail-title">{article.title}</h1>
        <div className="detail-meta">
          <span>PULSE EDITORIAL</span>
          <span> · </span>
          <span>{article.date || '2026.04.27'}</span>
        </div>
      </header>

      <div className="detail-hero-img">
        <img src={article.image} alt={article.title} />
      </div>

<main className="detail-content">
  {/* AI 요약 섹션 */}
  <blockquote className="ai-summary">
    <span className="summary-label">INSIGHT & SUMMARY</span>
    <p>{article.summary}</p>
  </blockquote>

  {/* 본문 대용 섹션 */}
  <div className="full-text">
    <p>
      현재 이 기사는 외부 매체(RSS)를 통해 큐레이션된 콘텐츠입니다. 
      PULSE는 독자분들께 가장 핵심적인 인사이트를 빠르게 전달하기 위해 요약된 정보를 제공하고 있습니다.
    </p>
    <p style={{ marginTop: '20px' }}>
      전체 기사 내용과 상세한 이미지는 아래 <b>'READ FULL ARTICLE'</b> 버튼을 통해 원문 사이트에서 확인하실 수 있습니다.
    </p>
    
    {/* 원문 링크 버튼을 더 크게! */}
    <a href={article.url} target="_blank" rel="noreferrer" className="read-more-btn">
      READ FULL ARTICLE →
    </a>
  </div>
</main>


    </div>
  );
};

export default ArticleDetail;