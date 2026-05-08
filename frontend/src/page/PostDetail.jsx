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

  useEffect(() => {
  const handleScroll = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    setScrollProgress(progress);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  if (loading) return <div className="loading">LOADING CONTENT...</div>;
  if (!post) return null;

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← BACK</button>

      <div style={{
        position: 'fixed',
        top: '64px', // Nav 높이에 맞춰주세요 (보통 64px)
        left: 0,
        width: `${scrollProgress}%`,
        height: '2px', // 아주 얇게!
        backgroundColor: '#1a1a1a', // 너무 진한 검정 말고 살짝 힘 뺀 차콜색
        zIndex: 1001,
        transition: 'width 0.1s ease-out'
      }} />
      
      <article className="detail-article">
        <header className="detail-header">
          <span className="detail-category">{post.category}</span>
          <h1 className="detail-title">{post.title}</h1>
          <time className="detail-date">{post.created_at?.split('T')[0]}</time>
        </header>

        {/* 에디터에서 작성한 HTML 내용을 그대로 렌더링 */}
        <div 
          className="detail-content ql-editor" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </article>
    </div>
  );
};

export default PostDetail;