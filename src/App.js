import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { listNotes } from "./graphql/queries";
// NEW: Import the createNote and deleteNote mutations
import { createNote, deleteNote } from "./graphql/mutations";

function App({ signOut, user }) {
  const [notes, setNotes] = useState([]);
  const [noteData, setNoteData] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const apiData = await API.graphql({ query: listNotes });
      setNotes(apiData.data.listNotes.items);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  }

  const handleCreateNote = async (e) => {
    e.preventDefault();
    const { title, content } = noteData;
    if (!title) return;

    try {
      await API.graphql({
        query: createNote,
        variables: { input: { title, content } }
      });
      fetchNotes(); // Re-fetch notes after creating a new one
      setNoteData({ title: '', content: '' });
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  // NEW: Function to handle deleting a note
  async function handleDeleteNote(noteId) {
    try {
      await API.graphql({
        query: deleteNote,
        variables: { input: { id: noteId } }
      });
      // After deleting, update the notes list in the UI
      const newNotesArray = notes.filter(note => note.id !== noteId);
      setNotes(newNotesArray);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>My Notes App</h1>
      <p>Welcome, {user.username}!</p>

      <form onSubmit={handleCreateNote} style={{ margin: '20px auto', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="Note Title"
          value={noteData.title}
          onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
        />
        <textarea
          placeholder="Note Content"
          value={noteData.content}
          onChange={(e) => setNoteData({ ...noteData, content: e.target.value })}
        />
        <button type="submit">Save Note</button>
      </form>

      <div style={{ marginTop: '20px' }}>
        {notes.map(note => (
          <div key={note.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px auto', maxWidth: '400px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>{note.title}</h2>
              <p>{note.content}</p>
            </div>
            {/* NEW: Delete button for each note */}
            <button onClick={() => handleDeleteNote(note.id)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        ))}
      </div>

      <button onClick={signOut} style={{ marginTop: '20px' }}>Sign Out</button>
    </div>
  );
}

export default withAuthenticator(App);