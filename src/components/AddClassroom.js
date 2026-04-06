import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { query, where, getDocs } from "firebase/firestore";

export default function AddClassroom({ onAdd, darkMode }) {
  const [block, setBlock] = useState("AB1");
  const [room, setRoom] = useState("");

  const addClassroom = async () => {
  if (!room) {
    alert("Enter room number");
    return;
  }

  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  // ⏰ Time restriction
  if (h < 8 || (h === 19 && m > 30) || h > 19) {
    alert("Allowed only between 8 AM - 7:30 PM");
    return;
  }

  try {
    // 🔍 Check duplicate (same block + room)
    const q = query(
      collection(db, "classrooms"),
      where("block", "==", block),
      where("room", "==", room)
    );

    const snapshot = await getDocs(q);

    const now = new Date();

    const exists = snapshot.docs.some(doc => {
      const data = doc.data();
      return data.expiresAt?.toDate() > now; // only active ones
    });

    if (exists) {
      alert("This classroom is already added!");
      return;
    }

    // ⏳ Expiry
    const expires = new Date(now.getTime() + 45 * 60 * 1000);

    await addDoc(collection(db, "classrooms"), {
      block,
      room,
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(expires),
      likes: 0,
      dislikes: 0
    });

    onAdd && onAdd();
    alert("Classroom added!");
    setRoom("");

  } catch (err) {
    alert(err.message);
  }
};

  return (
  <div>
    {/* 🧾 TITLE */}
    <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
      Add Classroom
    </h2>

    {/* 🏫 BLOCK + ROOM */}
    <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
      
      <select
        value={block}
        onChange={(e) => setBlock(e.target.value)}
        style={{
          flex: 1,
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          background: darkMode ? "#444" : "white",
          color: darkMode ? "white" : "black"
        }}
      >
        <option>AB1</option>
        <option>AB2</option>
        <option>CB</option>
      </select>

      <input
        placeholder="Room number"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        style={{
          flex: 2,
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          background: darkMode ? "#444" : "white",
          color: darkMode ? "white" : "black"
        }}
      />
    </div>

    {/* ➕ ADD BUTTON */}
    <button
      onClick={addClassroom}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        background: "#007bff",
        color: "white",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer"
      }}
    >
      + Add Classroom
    </button>
  </div>
);
}