import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './PostDetail.css'; // 전용 CSS 하나 만들게요!

const PostDetail = () => {
  const { id } = useParams(); // URL에서 ID 가져오기
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        navigate('/'); // 에러 나면 메인으로 튕기기
      } else {
        setPost(data);
      }
      setLoading(false);
    };

    fetchPost();
  }, [id, navigate]);

  // [기존 코드 아래에 추가] 스크롤 프로그레스 로직
useEffect(() => {
  const updateScroll = () => {
    const currentScrollY = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (currentScrollY / totalHeight) * 100;
    setScrollProgress(progress);
  };

  window.addEventListener("scroll", updateScroll);
  return () => window.removeEventListener("scroll", updateScroll);
}, []);

  if (loading) return <div className="loading">LOADING CONTENT...</div>;
  if (!post) return null;

return (
    <div className="detail-container">
      {/* 1. 스크롤 진행 바 (고정 위치) */}
      <div style={{
        position: 'fixed',
        top: '0', // 만약 상단 nav가 없다면 0, 있다면 nav 높이만큼(64px) 내리세요
        left: 0,
        width: `${scrollProgress}%`,
        height: '4px', // 조금 더 잘 보이게 4px 추천!
        background: '#000',
        zIndex: 1001,
        transition: 'width 0.1s ease-out'
      }} />

      {/* 2. 상단 네비게이션 영역 (없다면 이 버튼만 유지) */}
      <nav className="detail-nav" style={{ display: 'flex', alignItems: 'center', height: '64px', padding: '0 20px' }}>
        <button className="back-btn" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
          ← BACK
        </button>
        {/* 중앙 로고를 넣고 싶다면 여기에 추가하세요 */}
      </nav>
      
      <article className="detail-article">
        <header className="detail-header">
          <span className="detail-category">{post.category}</span>
          <h1 className="detail-title">{post.title}</h1>
          <time className="detail-date">{post.created_at?.split('T')[0]}</time>
        </header>

        {/* 에디터 내용 렌더링 */}
        <div 
          className="detail-content ql-editor" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </article>
    </div>
  );
};

export default PostDetail;