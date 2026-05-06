import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import Loader from "./components/Loader/Loader"; 
import MainFeed from "./components/MainFeed/MainFeed";
import ArticleDetail from "./components/ArticleDetail/ArticleDetail";
import Auth from './page/Auth';
import MyPage from './page/MyPage';
import Admin from './page/Admin';
import History from './page/History';
import Onboarding from './page/Onboarding';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const location = useLocation();

  const handleStart = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1400); 
  };

  return (
    <div className="App" onClick={isLoading ? handleStart : undefined}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loader key="loader" isExiting={isExiting} />
        ) : (
          <Routes location={location} key={location.pathname}>
            {/* 메인 피드 */}
            <Route path="/" element={<MainFeed />} />
            
            {/* 상세 페이지: /post/:id 와 /article/:id 둘 다 작동하게 안전장치 */}
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/post/:id" element={<ArticleDetail />} /> 
            
            {/* 기타 페이지 */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/history" element={<History />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;