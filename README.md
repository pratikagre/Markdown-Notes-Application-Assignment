# Markdown Notes App

A full-stack Markdown Notes Application built with React, Node.js, Express, and SQLite.

## Features

- **Live Split-Screen Preview**: Write markdown on the left, see rendered HTML on the right in real-time.
- **CRUD Operations**: Create, Read, Update, and Delete notes.
- **Markdown Support**: Headings, lists, bold, italics, code blocks, and hyperlinks are fully supported.
- **Debounced Auto-Save**: Notes are automatically saved to the database 1 second after you stop typing.
- **Search Notes**: Full-text search to easily find your notes.
- **Dark Mode**: Toggle between light and dark themes for better readability.

## Tech Stack

- **Frontend**: React (Vite), CSS (Custom styling), react-markdown, axios
- **Backend**: Node.js, Express, CORS
- **Database**: SQLite3

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.

### Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will run on http://localhost:5000 and automatically create a `notes.db` SQLite database file.*

### Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL (typically http://localhost:5173) in your browser.

## Database Migrations
No extra configuration is needed! The SQLite database will automatically be initialized via `database.js` mapping to a `notes.db` file within the `backend` folder when the server is started for the first time.

## Evaluation Areas Covered:
- **Clean Structure**: Separated frontend and backend directories with organized dependencies.
- **REST APIs**: Designed RESTful APIs using standard endpoints (`GET`, `POST`, `PUT`, `DELETE`).
- **UI & UX**: Responsive, clean split-screen, debounce auto-save, dark mode toggle.
