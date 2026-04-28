import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom'; 
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // 👈 히스토리에서 보낸 데이터를 받는 곳
  const quillRef = useRef(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('IT / TECH');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // 수정 모드인지 판별 (데이터가 있으면 true)
  const isEditMode = !!state?.editData;

  // 수정 모드일 때 데이터 채워넣기
  useEffect(() => {
    if (state?.editData) {
      setTitle(state.editData.title);
      setContent(state.editData.content);
      setCategory(state.editData.category);
    }
  }, [state]);

  const safeNavigate = (targetPath) => {
    const isDirty = title.trim() || (content && content !== '<p><br></p>');
    if (isDirty && !msg) {
      if (window.confirm("작성 중인 내용이 있습니다. 저장하지 않고 이동하시겠습니까?")) {
        navigate(targetPath);
      }
    } else {
      navigate(targetPath);
    }
  };

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
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        editor.insertEmbed(range.index, 'image', publicUrl);
      } catch (error) {
        alert('이미지 업로드 실패!');
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [[{ 'header': [1, 2, false] }], ['bold', 'italic', 'underline', 'strike'], [{ 'align': [] }], ['link', 'image'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['clean']],
      handlers: { image: imageHandler },
    },
  }), []);

  // 👈 2. 함수 이름을 handleSave로 통일! (handlePublish 대신)
  const handleSave = async () => {
    if (!title || !content) {
      setMsg('제목과 내용을 입력해주세요.');
      return;
    }
    setLoading(true);

    try {
      if (isEditMode) {
        // [수정 모드] 기존 기사 덮어쓰기 (Update)
        const { error } = await supabase
          .from('newsletters')
          .update({ title, content, category })
          .eq('id', state.editData.id); // 👈 ID가 일치하는 놈만 수정!

        if (error) throw error;
        setMsg('수정 완료! 히스토리로 이동합니다.');
        setTimeout(() => navigate('/history'), 1500);
      } else {
        // [신규 모드] 새 기사 추가 (Insert)
        const { error } = await supabase
          .from('newsletters')
          .insert({ 
            title, 
            content, 
            category, 
            status: 'sent', // 👈 '발송 완료' 상태 주입
            created_at: new Date().toISOString() 
          });

        if (error) throw error;
        setMsg('발행 완료! 메인 피드에 추가되었습니다.');
        setTitle('');
        setContent('');
      }
    } catch (err) {
      setMsg('저장 실패: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <button className="back-btn" onClick={() => safeNavigate('/')}>← BACK</button>
      <header className="admin-header">
        <p className="admin-sub">{isEditMode ? 'EDIT POST' : 'CREATE NEW CONTENT'}</p>
      </header>

      <section className="editor-section">
        <input type="text" placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} className="admin-input" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-select">
          <option>IT / TECH</option>
          <option>DESIGN</option>
          <option>TREND</option>
        </select>
        <ReactQuill ref={quillRef} theme="snow" value={content} onChange={setContent} modules={modules} className="admin-editor" placeholder="내용을 입력하세요..." />

        {msg && (
          <div className="admin-msg-box">
            <p className="admin-msg">{msg}</p>
            <button className="go-history-btn" onClick={() => navigate('/history')}>발송 이력 전체보기 →</button>
          </div>
        )}

        {/* 👈 3. onClick에 handleSave를 연결! */}
        <button className="publish-btn" onClick={handleSave} disabled={loading}>
          {loading ? '저장 중...' : isEditMode ? '수정 완료하기 ✓' : '발행하기 →'}
        </button>

        <button className="history-nav-btn" onClick={() => safeNavigate('/history')}>히스토리 보러가기 →</button>
      </section>
    </div>
  );
};

export default Admin;