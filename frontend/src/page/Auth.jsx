import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeyDown = (e) => {
  if (e.key === 'Enter') handleSubmit();
  };


  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate('/');
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else {
        navigate('/onboarding');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 
          className="auth-logo" 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer' }}
        >
          PULSE
        </h1>
        <p className="auth-sub">읽는 경험을 디자인하다</p>

        <div className="auth-toggle">
          <button 
            className={isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(true)}
          >로그인</button>
          <button 
            className={!isLogin ? 'active' : ''} 
            onClick={() => setIsLogin(false)}
          >회원가입</button>
        </div>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          className="auth-input"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="auth-input"
        />

        {error && <p className="auth-error">{error}</p>}

        <button 
          className="auth-btn" 
          onClick={handleSubmit}
          
          disabled={loading}
        >
          {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
        </button>

      </div>
    </div>
  );
};

export default Auth;