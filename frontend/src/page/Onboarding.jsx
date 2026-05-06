import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

const CATEGORIES = ['IT / TECH', 'DESIGN', 'TREND'];

const Onboarding = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  const toggle = (cat) => {
    setSelected(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleDone = () => {
    const saved = selected.length > 0 ? selected : CATEGORIES;
    localStorage.setItem('pulse_categories', JSON.stringify(saved));
    navigate('/');
  };

  return (
    <div className="onboarding-container">
      <h1 className="onboarding-title">PULSE</h1>
      <p className="onboarding-sub">관심 있는 카테고리를 선택해주세요</p>

      <div className="onboarding-cats">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`onboarding-cat-btn ${selected.includes(cat) ? 'active' : ''}`}
            onClick={() => toggle(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <button
        className="onboarding-done-btn"
        onClick={handleDone}
        disabled={selected.length === 0}
      >
        시작하기 →
      </button>
    </div>
  );
};

export default Onboarding;