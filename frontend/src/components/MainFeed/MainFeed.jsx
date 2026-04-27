import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiTerminalBoxLine, RiQuillPenLine, RiPulseLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import './MainFeed.css';

const MainFeed = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const techArticles = articles.filter(a => a.category === 'IT / TECH');
  const designArticles = articles.filter(a => a.category === 'DESIGN');
  const trendArticles = articles.filter(a => a.category === 'TREND');

useEffect(() => {
  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:8000/articles');
      const data = await response.json();

      const formattedArticles = data.map((item, index) => ({
        title: item.title,
        image: item.image || `https://picsum.photos/seed/${index + 123}/800/600`,
        publishedAt: item.published_at,
        url: item.url,
        summary: item.summary,
        category: item.category,
        id: item.id
      }));
      setArticles(formattedArticles);
    } catch (e) {
      console.error("기사 로드 실패", e);
    } finally {
      setLoading(false);
    }
  };

  fetchArticles();
}, []);



  // 2. 카테고리 기호 데이터
  const categories = [
    { 
      symbol: <RiTerminalBoxLine size={32} color="#1a1a1a" />, // 펄스 블루 포인트!
      label: 'IT / TECH', 
      desc: '내일을 결정짓는 기술의 흐름을 분석합니다.' 
    },
    { 
      symbol: <RiQuillPenLine size={32} color="#1a1a1a" />, 
      label: 'DESIGN', 
      desc: '전 세계의 감각적인 비주얼 언어를 기록합니다.' 
    },
    { 
      symbol: <RiPulseLine size={32} color="#1a1a1a" />, 
      label: 'TREND', 
      desc: '지금 2030이 반응하는 문화 현상을 쫓습니다.' 
    },
  ];


  // 3. 타이핑 효과 로직
  const [text, setText] = useState('');
  const fullText = "STAY IN THE PULSE";
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(140);

  useEffect(() => {
    const handleTyping = () => {
      const updatedText = isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1);

      setText(updatedText);

      if (!isDeleting && updatedText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000); // 다 치고 2초 대기
        setTypingSpeed(120);
      } else if (isDeleting && updatedText === '') {
        setIsDeleting(false);
        setTypingSpeed(250); // 다 지우고 다시 시작 속도
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, typingSpeed]);

  return (
    <div className="jandi-style-container">
      {/* Hero Section */}
      <section className="hero-section">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="hero-tag">WEEKLY TREND CURATION</span>
          <h1 className="hero-title">
            {text}
            <span className="terminal-cursor">|</span>
          </h1>
          <p className="hero-desc">
            가장 앞서가는 IT, 디자인, 트렌드 소식을<br />
            매주 월요일 아침, 당신의 메일함으로 전달합니다.
          </p>
          <div className="subscription-box">
            <input type="email" placeholder="이메일 주소를 입력하세요" className="sub-input" />
            <button className="sub-btn">무료로 구독하기</button>
          </div>

        </motion.div>
      </section>

      {/* Category Section */}
{/* 1. IT / TECH 섹션 */}
<section className="content-archive">
  <div className="archive-header">
    <span className="arc-id">01</span>
    <h2 className="arc-title">LATEST TECH PULSE</h2>
  </div>
  <div className="article-grid">
    {techArticles.map((article, index) => (
      <div key={index} className="article-card" onClick={() => navigate(`/article/${article.id}`, { state: { data: article } })}>
        <div className="article-img"><img src={article.image} alt="" /></div>
        <div className="article-body">
          <span className="date">{article.publishedAt?.split(' ')[0]}</span>
          <h3>{article.title}</h3>
        </div>
      </div>
    ))}
  </div>
</section>

{/* 2. DESIGN 섹션 (여기는 지그재그나 다른 스타일로 줘도 예뻐요!) */}
<section className="content-archive design-section">
  <div className="archive-header">
    <span className="arc-id">02</span>
    <h2 className="arc-title">DESIGN INSPIRATION</h2>
  </div>
  <div className="article-grid">
    {designArticles.length > 0 ? (
      designArticles.map((article, index) => (
        <div key={index} className="article-card" onClick={() => navigate(`/article/${article.id}`, { state: { data: article } })}>
          <div className="article-img"><img src={article.image} alt="" /></div>
          <div className="article-body"><h3>{article.title}</h3></div>
        </div>
      ))
    ) : (
      <p className="no-data">디자인 기사를 수집 중입니다...</p>
    )}
  </div>
</section>

{/* 3. TREND 섹션 */}
<section className="content-archive">
  <div className="archive-header">
    <span className="arc-id">03</span>
    <h2 className="arc-title">CULTURAL TRENDS</h2>
  </div>
  <div className="article-grid">
    {trendArticles.length > 0 ? (
      trendArticles.map((article, index) => (
        <div key={index} className="article-card" onClick={() => navigate(`/article/${article.id}`, { state: { data: article } })}>
          <div className="article-img"><img src={article.image} alt="" /></div>
          <div className="article-body">
            <h3>{article.title}</h3>
          </div>
        </div>
      ))
    ) : (
      <p className="no-data">트렌드 소식을 불러오지 못했습니다 ㅠ_ㅠ</p>
    )}
  </div>
</section>




      {/* Footer Section */}
<footer className="pulse-footer">
  <div className="footer-top">
    <div className="footer-brand">
      <h2 className="footer-logo">PULSE</h2>
      <p>가장 앞서가는 IT, 디자인, 트렌드 큐레이션</p>
    </div>
    <div className="footer-links">
      <a href="#about">ABOUT</a>
      <a href="#archive">ARCHIVE</a>
      <a href="#contact">CONTACT</a>
    </div>
  </div>
  
  <div className="footer-bottom">
    <div className="copyright">
      <span>© 2026 PULSE. ALL RIGHTS RESERVED.</span>
      <span className="slogan">읽는 경험을 디자인하다</span>
    </div>
    <button className="top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      BACK TO TOP ↑
    </button>
  </div>
</footer>
    </div>
  );
};

export default MainFeed;