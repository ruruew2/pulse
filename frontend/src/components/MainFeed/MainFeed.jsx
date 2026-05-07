import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RiTerminalBoxLine, RiQuillPenLine, RiPulseLine } from "react-icons/ri";
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react'; // 상단에 추가
import { supabase } from "../../supabaseClient";
import './MainFeed.css';

const MainFeed = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const savedCats = JSON.parse(localStorage.getItem('pulse_categories') || '["IT / TECH","DESIGN","TREND"]');
  const techArticles = savedCats.includes('IT / TECH') ? articles.filter(a => a.category === 'IT / TECH') : [];
  const designArticles = savedCats.includes('DESIGN') ? articles.filter(a => a.category === 'DESIGN') : [];
  const trendArticles = savedCats.includes('TREND') ? articles.filter(a => a.category === 'TREND') : [];

const fetchAllData = async () => {
  setLoading(true);
  try {
    const { data: supabaseData, error } = await supabase
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (supabaseData || []).map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      publishedAt: item.created_at,
      image: item.image || `https://picsum.photos/seed/${item.id}/800/600`,
      source: 'newsletter'
    }));

    setArticles(formatted);
  } catch (e) {
    console.error("데이터 로드 실패", e);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAllData();

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

  const handleCardClick = (article) => {
    const path = article.source === 'newsletter'
      ? `/post/${article.id}`
      : `/article/${article.id}`;
    navigate(path, { state: { data: article } });
  };

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

  const ArticleCard = ({ article, showDate = false }) => (
    <div className="article-card" onClick={() => handleCardClick(article)}>
      <div className="article-img"><img src={article.image} alt="" /></div>
      <div className="article-body">
        {showDate && <span className="date">{article.publishedAt?.split('T')[0] || article.publishedAt?.split(' ')[0]}</span>}
        <h3>{article.title}</h3>
      </div>
    </div>
  );

return (
  <div className="jandi-style-container">
    <nav className="main-nav">
      <div className="nav-logo" onClick={() => navigate('/')}>PULSE</div>
      <div className="nav-auth">
        {user ? (
          <div className="user-info">
            {/* 이메일은 CSS에서 모바일일 때만 숨깁니다 */}
            <span className="user-email">{user.email.split('@')[0]}님</span>
            
<button onClick={() => navigate('/mypage')} className="auth-nav-btn mypage">
  <span className="pc-text">마이페이지</span>
  <User size={18} className="mobile-icon" /> {/* 👤 대신 사용 */}
</button>

<button onClick={handleLogout} className="auth-nav-btn logout">
  <span className="pc-text">로그아웃</span>
  <LogOut size={18} className="mobile-icon" /> {/* ⎋ 대신 사용 */}
</button>
          </div>
        ) : (
          <button onClick={() => navigate('/auth')} className="auth-nav-btn login">
            로그인 / 회원가입
          </button>
        )}
      </div>
    </nav>

      <section className="hero-section">
        <motion.div className="hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="hero-tag">WEEKLY TREND CURATION</span>
          <h1 className="hero-title">{text}<span className="terminal-cursor">|</span></h1>
          <p className="hero-desc">가장 앞서가는 IT, 디자인, 트렌드 소식을<br />매주 월요일 아침, 당신의 메일함으로 전달합니다.</p>
        </motion.div>
      </section>

      <section className="category-feature-grid">
        {categories.map((cat) => (
          <div className="feature-item" key={cat.label}>
            <div className="cat-symbol">{cat.symbol}</div>
            <h3>{cat.label}</h3>
            <p>{cat.desc}</p>
          </div>
        ))}
      </section>

      <section className="content-archive">
        <div className="archive-header">
          <span className="arc-id">01</span>
          <h2 className="arc-title">LATEST TECH</h2>
        </div>
        <div className="article-grid">
          {techArticles.length > 0 ? (
            techArticles.map((article, index) => (
              <ArticleCard key={index} article={article} showDate={true} />
            ))
          ) : (
            <p className="no-data">테크 소식을 확인하고 싶으시다면 설정에서 선택해주세요!</p>
          )}
        </div>
      </section>

      <section className="content-archive design-section">
        <div className="archive-header">
          <span className="arc-id">02</span>
          <h2 className="arc-title">DESIGN INSPIRATION</h2>
        </div>
        <div className="article-grid">
          {designArticles.length > 0 ? (
            designArticles.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))
          ) : (
            <p className="no-data">디자인 소식을 확인하고 싶으시다면 설정에서 선택해주세요!</p>
          )}
        </div>
      </section>

      <section className="content-archive">
        <div className="archive-header">
          <span className="arc-id">03</span>
          <h2 className="arc-title">CULTURAL TRENDS</h2>
        </div>
        <div className="article-grid">
          {trendArticles.length > 0 ? (
            trendArticles.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))
          ) : (
            <p className="no-data">트렌드 소식을 확인하고 싶으시다면 설정에서 선택해주세요!</p>
          )}
        </div>
      </section>

      {user && user.email === 'pulse@naver.com' && (
        <button className="floating-edit-btn" onClick={() => navigate('/admin')} title="에디터 페이지로 이동">
          <RiQuillPenLine size={24} />
        </button>
      )}

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