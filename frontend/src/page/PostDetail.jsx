import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './PostDetail.css'; // 전용 CSS 하나 만들게요!

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // ✅ 데이터 페칭
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', id)
        .single();
      // ... 에러 처리 생략
      setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [id, navigate]);

  // ✅ 스크롤 로직 (반드시 if문보다 위에!)
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ⚠️ 에러 방지: 모든 Hook이 선언된 '후에' return 해야 함
  if (loading) return <div className="loading">LOADING CONTENT...</div>;
  if (!post) return null;

return (
    <div style={{ width: '100%' }}>
      {/* 선은 컨테이너 밖으로 탈출 */}
      <div style={{
        position: 'fixed',
        top: '64px', 
        left: 0,
        width: `${scrollProgress}%`,
        height: '3px',
        backgroundColor: '#000',
        zIndex: 9999,
        transition: 'width 0.1s ease-out',
        pointerEvents: 'none'
      }} />
      
      <div className="detail-container">
        <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>
        
        <article className="detail-article">
          <header className="detail-header">
            <span className="detail-category">{post.category}</span>
            <h1 className="detail-title">{post.title}</h1>
            <time className="detail-date">{post.created_at?.split('T')[0]}</time>
          </header>

          <div 
            className="detail-content ql-editor" 
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </article>
      </div>
    </div>
  );
};

export default PostDetail;