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

// Save a note
function saveNote() {
  const noteText = document.getElementById("noteInput").value;
  if (noteText.trim() === "") {
    alert("Note cannot be empty!");
    return;
  }

  let tx = db.transaction("notes", "readwrite");
  let store = tx.objectStore("notes");
  store.add({ text: noteText });

  tx.oncomplete = function() {
    document.getElementById("noteInput").value = "";
    loadNotes();
  };
}

// Load all notes
function loadNotes() {
  let tx = db.transaction("notes", "readonly");
  let store = tx.objectStore("notes");
  let request = store.getAll();

  request.onsuccess = function() {
    const notes = request.result;
    const list = document.getElementById("notesList");
    list.innerHTML = "";

    notes.forEach(note => {
      const li = document.createElement("li");
      li.textContent = note.text;
      list.appendChild(li);
    });
  };
}
