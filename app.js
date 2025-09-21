let db;

// Open (or create) database
let request = window.indexedDB.open("NotesDB", 1);

request.onerror = function(event) {
  console.error("Database error:", event.target.error);
};



request.onupgradeneeded = function(event) {
  db = event.target.result;
  // Create an object store for notes if it doesn't exist
  if (!db.objectStoreNames.contains("notes")) {
    db.createObjectStore("notes", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = function(event) {
  db = event.target.result;
  loadNotes();
};

// Save a new note
function saveNote() {
  const noteText = document.getElementById("noteInput").value;
  if (noteText.trim() === "") {
    alert("Note cannot be empty!");
    return;
  }

  let tx = db.transaction("notes", "readwrite");
  let store = tx.objectStore("notes");
  store.add({ text: noteText });

  // When the transaction is complete, clear the input and reload notes
  tx.oncomplete = function() {
    document.getElementById("noteInput").value = "";
    loadNotes();
  };
}

// Load all notes
function loadNotes(search = "") {
  let tx = db.transaction("notes", "readonly");
  let store = tx.objectStore("notes");
  let request = store.getAll();

  request.onsuccess = function() {
    const notes = request.result;
    const list = document.getElementById("notesList");
    list.innerHTML = "";

       notes
      .filter(note => note.text.toLowerCase().includes(search.toLowerCase()))
      .forEach(note => {
        const li = document.createElement("li");

        const span = document.createElement("span");
        span.className = "note-text";
        span.textContent = note.text;

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => editNote(note);

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => deleteNote(note.id);

        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(delBtn);
        list.appendChild(li);
      });
  };
}

// Delete note
function deleteNote(id) {
  let tx = db.transaction("notes", "readwrite");
  let store = tx.objectStore("notes");
  store.delete(id);

  tx.oncomplete = function() {
    loadNotes();
  };
}

// Edit note
function editNote(note) {
  const newText = prompt("Edit your note:", note.text);
  if (newText && newText.trim() !== "") {
    let tx = db.transaction("notes", "readwrite");
    let store = tx.objectStore("notes");
    store.put({ id: note.id, text: newText });

    tx.oncomplete = function() {
      loadNotes();
    };
  }
}

// Search notes
function searchNotes() {
  const searchInput = document.getElementById("searchInput").value;
  loadNotes(searchInput);
}

// Export notes to text file
function exportNotes() {
  let tx = db.transaction("notes", "readonly");
  let store = tx.objectStore("notes");
  let request = store.getAll();

  request.onsuccess = function() {
    const notes = request.result.map(n => n.text).join("\n---\n");
    const blob = new Blob([notes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.txt";
    a.click();

    URL.revokeObjectURL(url);
  };
}
