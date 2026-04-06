import { auth } from "../firebase";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { deleteDoc } from "firebase/firestore";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  increment
} from "firebase/firestore";

export default function ClassroomList({ darkMode }) {
  const [rooms, setRooms] = useState([]);
  const [block, setBlock] = useState("ALL");

  useEffect(() => {
  const q =
    block === "ALL"
      ? collection(db, "classrooms")
      : query(
          collection(db, "classrooms"),
          where("block", "==", block)
        );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const now = new Date();

    const validData = [];

    for (const d of snapshot.docs) {
      const data = d.data();

      if (data.expiresAt?.toDate() > now) {
        // ✅ still valid → show
        validData.push({
          id: d.id,
          ...data
        });
      } else {
        // 🔥 expired → delete from database
        try {
          await deleteDoc(doc(db, "classrooms", d.id));
        } catch (e) {
          // ignore if already deleted
          console.log("Already deleted:", d.id);
        }
      }
    }

    setRooms(validData);
  });

  return () => unsubscribe();
}, [block]);

  // ⏱ Format time
  const getTimeAgo = (timestamp) => {
  if (!timestamp) return "";

  const now = new Date();
  const created = timestamp.toDate();

  const diffMs = now - created;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;

  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays} day ago`;
};

  const handleLike = async (id) => {
  const user = auth.currentUser;
  if (!user) return;

  const likeKey = user.email + "_like_" + id;
  const dislikeKey = user.email + "_dislike_" + id;

  // ❌ if already reacted (like OR dislike)
  if (localStorage.getItem(likeKey) || localStorage.getItem(dislikeKey)) {
    alert("You have already reacted to this classroom");
    return;
  }

  const ref = doc(db, "classrooms", id);

  await updateDoc(ref, {
    likes: increment(1)
  });

  localStorage.setItem(likeKey, "true");
};


const handleDislike = async (id) => {
  const user = auth.currentUser;
  if (!user) return;

  const likeKey = user.email + "_like_" + id;
  const dislikeKey = user.email + "_dislike_" + id;

  // ❌ if already reacted (like OR dislike)
  if (localStorage.getItem(likeKey) || localStorage.getItem(dislikeKey)) {
    alert("You have already reacted to this classroom");
    return;
  }

  const ref = doc(db, "classrooms", id);

  await updateDoc(ref, {
    dislikes: increment(1)
  });

  localStorage.setItem(dislikeKey, "true");
};

  return (
    <div>
        <div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px"
}}>
  {/* <h2 style={{ margin: 0 }}>Available Classrooms</h2> */}

  <select
    value={block}
    onChange={(e) => setBlock(e.target.value)}
    style={{
      padding: "8px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      cursor: "pointer"
    }}
  >
    <option value="ALL">All</option>
    <option value="AB1">AB1</option>
    <option value="AB2">AB2</option>
    <option value="CB">CB</option>
  </select>
</div>

        {rooms.length === 0 ? (
        <p>No classrooms available</p>
        ) : (
        rooms.map((r) => (
  <div
    key={r.id}
    style={{
  position: "relative",
  background: darkMode ? "#2c2c3e" : "white",
  color: darkMode ? "white" : "black",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "10px"
}}
  >
    <h3>{r.block} - {r.room}</h3>

    <p style={{
  fontSize: "12px",
  color: "gray",
  position: "absolute",
  bottom: "10px",
  right: "15px"
}}>
      updated {getTimeAgo(r.createdAt)}
    </p>

    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  
  <button
    onClick={() => handleLike(r.id)}
    style={{
      background: "#28a745",
      color: "white",
      border: "none",
      padding: "6px 10px",
      borderRadius: "6px",
      cursor: "pointer"
    }}
  >
    👍 {r.likes || 0}
  </button>

  <button
    onClick={() => handleDislike(r.id)}
    style={{
      background: "#dc3545",
      color: "white",
      border: "none",
      padding: "6px 10px",
      borderRadius: "6px",
      cursor: "pointer"
    }}
  >
    👎 {r.dislikes || 0}
  </button>

</div>

  </div>
))
        )}
    </div>
    );
}