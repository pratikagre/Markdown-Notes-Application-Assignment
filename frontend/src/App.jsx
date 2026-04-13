import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_URL = import.meta.env.PROD ? '/notes' : 'http://localhost:5000/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('light');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const fetchNotes = useCallback(async (query = '') => {
    try {
      const response = await axios.get(`${API_URL}?q=${query}`);
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes", error);
    }
  }, []);

  useEffect(() => {
    fetchNotes(searchQuery);
  }, [searchQuery, fetchNotes]);

  useEffect(() => {
    if (!activeNote) return;

    const saveNote = async () => {
      setSaveStatus('Saving...');
      try {
        await axios.put(`${API_URL}/${activeNote.id}`, {
          title: activeNote.title,
          content: activeNote.content
        });
        setSaveStatus('Saved');
        
        setNotes(prevNotes => prevNotes.map(n => 
          n.id === activeNote.id ? activeNote : n
        ));

        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error("Error saving note", error);
        setSaveStatus('Error saving');
      }
    };

    const timeoutId = setTimeout(saveNote, 1000);
    return () => clearTimeout(timeoutId);
  }, [activeNote?.title, activeNote?.content, activeNote?.id]);

  const createNote = async () => {
    const title = window.prompt("Enter a title for your new note:", "New Note");
    if (title === null) return; 

    try {
      const response = await axios.post(API_URL, { title: title.trim() || 'Untitled Note', content: '' });
      setNotes([response.data, ...notes]);
      setActiveNote(response.data);
    } catch (error) {
      console.error("Error creating note", error);
    }
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      setNotes(notes.filter(n => n.id !== id));
      if (activeNote?.id === id) {
        setActiveNote(null);
      }
    } catch (error) {
      console.error("Error deleting note", error);
    }
  };

  const handleNoteChange = (field, value) => {
    setActiveNote({
      ...activeNote,
      [field]: value
    });
  };

  // ------------------ Views ------------------

  const renderDashboard = () => (
    <div className="dashboard-container">
      <div className="top-bar">
        <button className="btn-primary" onClick={createNote}>
          + ADD NOTE
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <div className="filter-row">
        <div className="search-box">
          <span role="img" aria-label="search">🔍</span>
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="notes-grid">
        {notes.map(note => (
          <div key={note.id} className="note-card" onClick={() => setActiveNote(note)}>
            <div className="card-top">
              <input type="checkbox" onClick={e => e.stopPropagation()} />
            </div>
            <h3>{note.title || 'Untitled'}</h3>
            <p>{note.content ? note.content.substring(0, 80) + '...' : 'No content'}</p>
            
            <div className="card-actions">
              <button 
                className="trash-icon" 
                title="Delete" 
                onClick={(e) => deleteNote(note.id, e)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div style={{ color: 'var(--text-muted)', marginTop: '20px' }}>
            No notes found. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="editor-wrapper">
      <div className="editor-header">
        <button className="btn-back" onClick={() => setActiveNote(null)}>
          ← Back
        </button>
        <input 
          type="text" 
          className="title-input" 
          value={activeNote.title}
          onChange={(e) => handleNoteChange('title', e.target.value)}
          placeholder="Note Title"
        />
        <div className="controls">
          {saveStatus && <span className="save-indicator">{saveStatus}</span>}
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      
      <div className="split-screen">
        <div className="editor-pane">
          <textarea 
            className="markdown-input" 
            value={activeNote.content}
            onChange={(e) => handleNoteChange('content', e.target.value)}
            placeholder="Type your markdown here..."
          />
        </div>
        <div className="preview-pane markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {activeNote.content || '*Preview will appear here*'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );

  return activeNote ? renderEditor() : renderDashboard();
}

export default App;
