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
    if (e) e.stopPropagation();
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

  return (
    <div className="layout-container">
      {/* LEFT: Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Notes</h2>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Dark Mode">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        
        <div className="sidebar-search">
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button className="btn-new-note" onClick={createNote}>
          + Create New Note
        </button>

        <div className="notes-list">
          {notes.map(note => (
            <div 
              key={note.id} 
              className={`note-card ${activeNote?.id === note.id ? 'active' : ''}`}
              onClick={() => setActiveNote(note)}
            >
              <h3>{note.title || 'Untitled Note'}</h3>
              <p>{note.content ? note.content.substring(0, 40) + '...' : 'No content'}</p>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="empty-state-sidebar">No notes found.</div>
          )}
        </div>
      </aside>

      {/* RIGHT: Main Split Editor */}
      <main className="main-content">
        {activeNote ? (
          <div className="editor-layout">
            <header className="editor-header">
              <input 
                type="text" 
                className="title-input" 
                value={activeNote.title}
                onChange={(e) => handleNoteChange('title', e.target.value)}
                placeholder="Note Title"
              />
              <div className="editor-actions">
                {saveStatus && <span className="save-indicator">{saveStatus}</span>}
                <button className="btn-delete" onClick={() => deleteNote(activeNote.id)}>
                  🗑️ Delete
                </button>
              </div>
            </header>
            
            <div className="split-view">
              <div className="pane raw-editor">
                <textarea 
                  value={activeNote.content}
                  onChange={(e) => handleNoteChange('content', e.target.value)}
                  placeholder="Type your markdown here..."
                />
              </div>
              <div className="pane preview markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeNote.content || '*Preview will appear here*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state-main">
            <h2>Welcome to Markdown Notes</h2>
            <p>Select a note from the sidebar or click "Create New Note" to start writing.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
