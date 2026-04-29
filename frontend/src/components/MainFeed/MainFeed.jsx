import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RiTerminalBoxLine, RiQuillPenLine, RiPulseLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../supabaseClient";
import './MainFeed.css';

const MainFeed = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]); // RSS 기사 + Supabase 기사 통합 상태
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 1. 카테고리 필터링 로직 (통합된 articles 기반)
  const savedCats = JSON.parse(localStorage.getItem('pulse_categories') || '["IT / TECH","DESIGN","TREND"]');
  const techArticles = savedCats.includes('IT / TECH') ? articles.filter(a => a.category === 'IT / TECH') : [];
  const designArticles = savedCats.includes('DESIGN') ? articles.filter(a => a.category === 'DESIGN') : [];
  const trendArticles = savedCats.includes('TREND') ? articles.filter(a => a.category === 'TREND') : [];

  // 2. 통합 데이터 불러오기 함수
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // (A) RSS 기사 가져오기 (기존 로직)
      const response = await fetch('https://pulse-dhro.onrender.com/articles');
      const rssData = await response.json(); 
      const formattedRss = rssData.map((item, index) => ({
        ...item,
        image: item.image || `https://picsum.photos/seed/${index + 123}/800/600`,
        publishedAt: item.published_at,
        source: 'RSS'
      }));

      // (B) Supabase 발행 글 가져오기
      const { data: supabaseData, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedSupabase = supabaseData.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        publishedAt: item.created_at,
        image: item.image || `https://picsum.photos/seed/${item.id}/800/600`, // 이미지가 없으면 랜덤
        source: 'PULSE'
      }));

      // (C) 두 데이터를 합치고 최신순 정렬
      const combined = [...formattedSupabase, ...formattedRss].sort((a, b) => 
        new Date(b.publishedAt) - new Date(a.publishedAt)
      );

      setArticles(combined);
    } catch (e) {
      console.error("데이터 로드 실패", e);
    } finally {
      setLoading(false);
    }
  };

  // 3. 로그인 상태 및 초기 데이터 로드
  useEffect(() => {
    fetchAllData(); // 기사 로드 실행

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert('로그아웃 되었습니다.');
  };

  // 4. 카테고리 기호 및 타이핑 로직 (기존과 동일)
  const categories = [
    { symbol: <RiTerminalBoxLine size={32} color="#1a1a1a" />, label: 'IT / TECH', desc: '내일을 결정짓는 기술의 흐름을 분석합니다.' },
    { symbol: <RiQuillPenLine size={32} color="#1a1a1a" />, label: 'DESIGN', desc: '전 세계의 감각적인 비주얼 언어를 기록합니다.' },
    { symbol: <RiPulseLine size={32} color="#1a1a1a" />, label: 'TREND', desc: '지금 2030이 반응하는 문화 현상을 쫓습니다.' },
  ];

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
        setTimeout(() => setIsDeleting(true), 2000);
        setTypingSpeed(120);
      } else if (isDeleting && updatedText === '') {
        setIsDeleting(false);
        setTypingSpeed(250);
      }
    };
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, typingSpeed]);

  if (loading) return <div className="loading-container">PULSE IS LOADING...</div>;

  return (
    <div className="jandi-style-container">
      <nav className="main-nav">
        <div className="nav-logo" onClick={() => navigate('/')}>PULSE</div>
        <div className="nav-auth">
          {user ? (
            <div className="user-info">
              <span className="user-email">{user.email.split('@')[0]}님</span>
              <button onClick={() => navigate('/mypage')} className="auth-nav-btn mypage">마이페이지</button>
              <button onClick={handleLogout} className="auth-nav-btn logout">로그아웃</button>
            </div>
          ) : (
            <button onClick={() => navigate('/auth')} className="auth-nav-btn login">로그인 / 회원가입</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <motion.div className="hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="hero-tag">WEEKLY TREND CURATION</span>
          <h1 className="hero-title">{text}<span className="terminal-cursor">|</span></h1>
          <p className="hero-desc">가장 앞서가는 IT, 디자인, 트렌드 소식을<br />매주 월요일 아침, 당신의 메일함으로 전달합니다.</p>
        </motion.div>
      </section>

      {/* Category Info Section */}
      <section className="category-feature-grid">
        {categories.map((cat) => (
          <div className="feature-item" key={cat.label}>
            <div className="cat-symbol">{cat.symbol}</div>
            <h3>{cat.label}</h3>
            <p>{cat.desc}</p>
          </div>
        ))}
      </section>

      {/* 1. IT / TECH 섹션 */}
      <section className="content-archive">
        <div className="archive-header">
          <span className="arc-id">01</span>
          <h2 className="arc-title">LATEST TECH</h2>
        </div>
        <div className="article-grid">
          {techArticles.length > 0 ? (
            techArticles.map((article, index) => (
              <div key={index} className="article-card" onClick={() => navigate(`/article/${article.id}`, { state: { data: article } })}>
                <div className="article-img"><img src={article.image} alt="" /></div>
                <div className="article-body">
                  <span className="date">{article.publishedAt?.split('T')[0] || article.publishedAt?.split(' ')[0]}</span>
                  <h3>{article.title}</h3>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">테크 소식을 확인하고 싶으시다면 설정에서 선택해주세요!</p>
          )}
        </div>
      </section>

      {/* 2. DESIGN 섹션 */}
      <section className="content-archive design-section">
        <div className="archive-header"><span className="arc-id">02</span><h2 className="arc-title">DESIGN INSPIRATION</h2></div>
        <div className="article-grid">
          {designArticles.length > 0 ? (
            designArticles.map((article, index) => (
              <div key={index} className="article-card" onClick={() => navigate(`/article/${article.id}`, { state: { data: article } })}>
                <div className="article-img"><img src={article.image} alt="" /></div>
                <div className="article-body"><h3>{article.title}</h3></div>
              </div>
            ))
          ) : (
            <p className="no-data">디자인 소식을 확인하고 싶으시다면 설정에서 선택해주세요!</p>
          )}
        </div>
      </section>

      {/* 3. TREND 섹션 */}
      <section className="content-archive">
        <div className="archive-header"><span className="arc-id">03</span><h2 className="arc-title">CULTURAL TRENDS</h2></div>
        <div className="article-grid">
          {trendArticles.length > 0 ? (
            trendArticles.map((article, index) => (
              <div key={index} className="article-card" onClick={() => navigate(`/article/${article.id}`, { state: { data: article } })}>
                <div className="article-img"><img src={article.image} alt="" /></div>
                <div className="article-body"><h3>{article.title}</h3></div>
              </div>
            ))
          ) : (
            <p className="no-data">트렌드 소식을 확인하고 싶으시다면 설정에서 선택해주세요!</p>
          )}
        </div>
      </section>

      {/* 관리자 플로팅 버튼 */}
      {user && user.email === 'pulse@naver.com' && (
        <button className="floating-edit-btn" onClick={() => navigate('/admin')} title="에디터 페이지로 이동">
          <RiQuillPenLine size={24} />
        </button>
      )}

      <footer className="pulse-footer">
        {/* 기존 푸터 내용 동일 */}
      </footer>
    </div>
  );
};

export default MainFeed;