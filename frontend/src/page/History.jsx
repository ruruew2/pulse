import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './Admin.css'; 
import './History.css'; 


const totalPosts = history.length;
const totalViews = history.reduce((acc, cur) => acc + (cur.views || 0), 0);
const sentPosts = history.filter(item => item.status === 'sent').length;


const History = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  // 1. 데이터 불러오기 함수
  const fetchHistory = async () => {
    const { data } = await supabase
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false });
    setHistory(data || []);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 2. 삭제 기능
  const handleDelete = async (e, id) => {
    e.preventDefault(); 
    if (window.confirm("정말로 이 기사를 삭제하시겠습니까?")) {
      const { error } = await supabase
        .from('newsletters')
        .delete()
        .eq('id', id);

      if (error) {
        alert("삭제 실패: " + error.message);
      } else {
        alert("삭제되었습니다.");
        fetchHistory(); 
      }
    }
  };

  // 3. 수정 기능 (Admin 페이지로 데이터 넘기기)
  const handleEdit = (e, item) => {
    e.preventDefault(); 
    navigate('/admin', { state: { editData: item } });
  };

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => navigate('/admin')}>
        ← BACK TO EDITOR
      </button>
      
<header className="admin-header">
  <h1 className="admin-title">발행록</h1>
  <p className="admin-sub">과거 발행된 모든 뉴스레터 기록</p>
  
  {/* 통계 대시보드 위젯 추가 */}
  <div className="stats-dashboard">
    <div className="stat-item">
      <span className="stat-label">TOTAL POSTS</span>
      <span className="stat-value">{totalPosts}</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">TOTAL VIEWS</span>
      <span className="stat-value">👁 {totalViews}</span>
    </div>
    <div className="stat-item">
      <span className="stat-label">SENT RATE</span>
      <span className="stat-value">{totalPosts > 0 ? Math.round((sentPosts / totalPosts) * 100) : 0}%</span>
    </div>
  </div>
</header>

      <div className="history-grid">
        {history.map((item) => (
          <div key={item.id} className="history-card-wrapper">
            {/* 카드 클릭 시 이동 */}
            <Link to={`/article/${item.id}`} className="history-card">
              <div className="history-card-header">
                <span className="history-cat">{item.category}</span>
                <span className="history-date">{item.created_at?.split('T')[0]}</span>
              </div>

              <h3 className="history-card-title">{item.title}</h3>
              
              <p className="history-card-preview">
                {item.content.replace(/<[^>]*>?/gm, '').substring(0, 60)}...
              </p>

              {/* 뱃지를 오른쪽 하단으로 배치하기 위해 footer 구조 변경 */}
              <div className="history-card-footer">
              <div className="footer-left">
              <span className="view-text">VIEW POST →</span>
              <span className="views-count">👁 {item.views || 0}</span> {/* 조회수 아이콘과 숫자 */}
            </div>
            <span className={`status-badge ${item.status === 'sent' ? 'sent' : 'draft'}`}>
              {item.status === 'sent' ? '발송 완료' : '발송 대기'}
            </span>
          </div>
            </Link>

            {/* 카드 하단 관리 버튼 (밤티버튼) */}
            <div className="history-card-actions">
              <button 
                className="edit-btn" 
                onClick={(e) => handleEdit(e, item)}
              >
                수정
              </button>
              <button 
                className="delete-btn" 
                onClick={(e) => handleDelete(e, item.id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;