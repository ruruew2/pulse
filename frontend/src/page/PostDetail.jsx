import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { createPortal } from 'react-dom'; // ✅ Portal 추가 확인!
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 1. 데이터 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error:', error);
        navigate('/');
      } else {
        setPost(data);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id, navigate]);

  // 2. 스크롤 로직
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <div className="loading">LOADING CONTENT...</div>;
  if (!post) return null;

  // ✅ 3. 리턴문 (태그 짝을 완벽하게 맞췄습니다)
  return (
    <>
      {createPortal(
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
        }} />,
        document.body
      )}

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
    </>
  );
};

export default PostDetail;