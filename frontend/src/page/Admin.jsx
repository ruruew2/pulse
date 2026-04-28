import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('IT / TECH');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // 1. 안전한 페이지 이동 핸들러 (브레이크 걸기)
  const safeNavigate = (targetPath) => {
    // 내용이 하나라도 적혀있으면 확인창 띄우기
    const isDirty = title.trim() || (content && content !== '<p><br></p>');
    
    if (isDirty) {
      const confirmLeave = window.confirm(
        "작성 중인 내용이 있습니다. 저장하지 않고 이동하시겠습니까?"
      );
      if (confirmLeave) navigate(targetPath);
    } else {
      navigate(targetPath);
    }
  };

  // 2. 이미지 업로드 핸들러 (Supabase Storage)
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `newsletter-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images') 
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        editor.insertEmbed(range.index, 'image', publicUrl);
      } catch (error) {
        console.error('업로드 실패:', error.message);
        alert('이미지 업로드에 실패했습니다. Storage 권한을 확인하세요!');
      }
    };
  };

  // 3. 에디터 툴바 설정
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'align': [] }], 
        ['link', 'image'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), []);

  // 4. 발행하기
  const handlePublish = async () => {
    if (!title || !content) {
      setMsg('제목과 내용을 입력해주세요.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('newsletters').insert({
      title,
      content,
      category,
      created_at: new Date().toISOString()
    });

    if (error) {
      setMsg('발행 실패: ' + error.message);
    } else {
      setMsg('발행 완료! 메인 피드에 추가되었습니다.');
      setTitle('');
      setContent('');
    }
    setLoading(false);
  };

  return (
    <div className="admin-container">
      {/* 뒤로가기 버튼에도 안전장치 적용 */}
      <button className="back-btn" onClick={() => safeNavigate('/')}>
        ← BACK
      </button>

      <section className="editor-section">
        <h2 className="section-label">NEW NEWSLETTER</h2>

        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="admin-input"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="admin-select"
        >
          <option>IT / TECH</option>
          <option>DESIGN</option>
          <option>TREND</option>
        </select>

        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          className="admin-editor"
          placeholder="내용을 입력하세요..."
        />

        {msg && (
          <div className="admin-msg-box">
            <p className="admin-msg">{msg}</p>
            <button className="go-history-btn" onClick={() => navigate('/history')}>
              발송 이력 전체보기 →
            </button>
          </div>
        )}

        <button
          className="publish-btn"
          onClick={handlePublish}
          disabled={loading}
        >
          {loading ? '발행 중...' : '발행하기 →'}
        </button>

        {/* 히스토리로 가는 화살표 버튼 */}
        <button 
          className="history-nav-btn" 
          onClick={() => safeNavigate('/history')}
        >
          히스토리 보러가기 →
        </button>
      </section>
    </div>
  );
};

export default Admin;