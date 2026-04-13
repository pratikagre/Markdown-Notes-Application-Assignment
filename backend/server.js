const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database.js');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/notes', (req, res) => {
    const query = req.query.q || '';
    if (query) {
        db.all("SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY id DESC", [`%${query}%`, `%${query}%`], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    } else {
        db.all("SELECT * FROM notes ORDER BY id DESC", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    }
});

app.post('/notes', (req, res) => {
    const { title, content } = req.body;
    db.run("INSERT INTO notes (title, content) VALUES (?, ?)", [title || 'Untitled Note', content || ''], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, title: title || 'Untitled Note', content: content || '' });
    });
});
app.put('/notes/:id', (req, res) => {
    const { title, content } = req.body;
    const { id } = req.params;
    db.run("UPDATE notes SET title = ?, content = ? WHERE id = ?", [title, content, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: Number(id), title, content });
    });
});

app.delete('/notes/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM notes WHERE id = ?", id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// --- PRODUCTION DEPLOYMENT SETUP ---
// Serve the built frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle React routing (fallback to index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
