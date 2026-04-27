import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const article = state?.data;

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
        {/* AI 요약 섹션 - 이 부분이 디자인 포인트! */}
        <blockquote className="ai-summary">
          <span className="summary-label">AI SUMMARY</span>
          <p>여기에 AI가 요약한 세 줄 정도의 핵심 문장이 들어갑니다. 에디토리얼 톤으로 정제된 문장이 디자인을 완성합니다.</p>
        </blockquote>

        <div className="full-text">
          <p>상세 본문 내용이 들어가는 자리입니다. Supabase에서 텍스트를 불러오게 될 거예요.</p>
        </div>
      </main>
    </div>
  );
};

export default ArticleDetail;