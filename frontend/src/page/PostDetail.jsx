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
    <div className="detail-container">
<div style={{
  position: 'fixed',
  top: '64px', 
  left: 0,
  /* ⚠️ vw 대신 %를 쓰되, 부모의 제약을 받지 않도록 width: 100%를 명시해줍니다 */
  width: '100%', 
  height: '3px',
  backgroundColor: 'transparent', // 배경은 투명하게
  zIndex: 9999,
  pointerEvents: 'none' // 클릭 방해 안 되게 추가
}}>
  <div style={{
    width: `${scrollProgress}%`, // 실제 움직이는 선
    height: '100%',
    backgroundColor: '#000',
    transition: 'width 0.1s ease-out'
  }} />
</div>
      
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