import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom'; // 라우터 도구들
import Loader from "./components/Loader/Loader"; 
import MainFeed from "./components/MainFeed/MainFeed";
import ArticleDetail from "./components/ArticleDetail/ArticleDetail"; // 상세페이지 불러오기

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const location = useLocation(); // 애니메이션 처리를 위해 경로 파악

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
          /* 메인피드와 상세페이지 사이의 전환을 Routes로 관리 */
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<MainFeed />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
          </Routes>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;