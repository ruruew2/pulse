import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import './Admin.css'; // 기존 카드 스타일 그대로 사용

const History = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });
      setHistory(data || []);
    };
    fetchHistory();
  }, []);

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => navigate('/admin')}>← BACK TO EDITOR</button>
      <header className="admin-header">
        <h1 className="admin-title">발행록</h1>
        <p className="admin-sub">과거 발행된 모든 뉴스레터 기록</p>
      </header>

      <div className="history-grid">
        {history.map((item) => (
          <Link to={`/post/${item.id}`} key={item.id} className="history-card">
            <div className="history-card-header">
              <span className="history-cat">{item.category}</span>
              <span className="history-date">{item.created_at?.split('T')[0]}</span>
            </div>
            <h3 className="history-card-title">{item.title}</h3>
            <p className="history-card-preview">{item.content.replace(/<[^>]*>?/gm, '').substring(0, 60)}...</p>
            <div className="history-card-footer">VIEW POST →</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default History;