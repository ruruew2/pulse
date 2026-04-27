import React from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const Loader = ({ isExiting }) => {
  // 주인공 커서 애니메이션
  const cursorVariants = {
    animate: {
      opacity: [1, 0, 1],
      transition: { duration: 1, repeat: Infinity, ease: "steps(2)" }
    },
    exit: { 
      scaleX: 5000, 
        scaleY: 400, 
        backgroundColor: "#fff",
        opacity: [1, 1, 0.7], // 마지막에 살짝 투명도를 낮추면 메인 피드와 더 부드럽게 섞여요
        transition: { 
          duration: 1.5, 
          // Cubic-bezier로 더 드라마틱하고 부드러운 속도감 부여
          ease: [0.8, 0, 0.5, 1] 
        } 
        }
      };

  // 텍스트(로고+슬로건) 퇴장 애니메이션
  const textVariants = {
    initial: { 
      opacity: 0, 
      y: 10 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    },
    exit: { 
      opacity: 0, 
      filter: "blur(15px)", 
      x: -20, 
      transition: { duration: 0.5, ease: "easeIn" } 
    }
  };

  return (
    <div className={`liquid-loader ${isExiting ? 'exit' : ''}`}>
      <div className="grain-overlay" />
      
      <motion.div 
        className="liquid-sphere"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="logo-container">
        <div className="logo-group">
          <h1 className="loader-logo">
            <motion.span 
              variants={textVariants} 
              animate={isExiting ? "exit" : "animate"}
            >
              PULSE
            </motion.span>
            
            {/* 커서는 독립적으로 움직임 */}
            <motion.span 
              className="terminal-cursor" 
              variants={cursorVariants} 
              animate={isExiting ? "exit" : "animate"}
              initial="animate"
            />
          </h1>

          {/* 여기에 기획서 문구 추가! */}
<motion.p 
    className="loader-slogan"
    variants={textVariants}
    initial="initial" // 처음 상태 추가
    animate={isExiting ? "exit" : "animate"}
  >
    읽는 경험을 디자인 하다
  </motion.p>
        </div>
      </div>

      {!isExiting && (
        <motion.div 
          className="click-guide" 
          animate={{ opacity: [0, 1, 0] }} 
          transition={{ duration: 2, repeat: Infinity }}
        >
          [ Click anywhere to begin ]
        </motion.div>
      )}
    </div>
  );
};

export default Loader;