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
  const [tick, setTick] = useState(0);

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
useEffect(() => {
  const interval = setInterval(() => {
    setTick(prev => prev + 1);
  }, 1000);

  return () => clearInterval(interval);
}, []);

  const getTimeLeft = (expiresAt) => {
  if (!expiresAt) return "";

  const now = new Date();
  const expiry = expiresAt.toDate();

  const diffMs = expiry - now;

  if (diffMs <= 0) return "Expired";

  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffSec = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (diffMin > 0) {
    return `⏳ ${diffMin} min left`;
  }

  return `⏳ ${diffSec} sec left`;
};

  const formatExpiryTime = (expiresAt) => {
  if (!expiresAt) return "";

  const date = expiresAt.toDate();

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

  const handleLike = async (id, roomData) => {
  const user = auth.currentUser;
  if (!user) return;

  // ❌ already voted
  if (roomData.votedUsers?.includes(user.email)) {
    alert("You already voted");
    return;
  }

  const ref = doc(db, "classrooms", id);

  await updateDoc(ref, {
    likes: increment(1),
    votedUsers: [...(roomData.votedUsers || []), user.email]
  });
};


const handleDislike = async (id, roomData) => {
  const user = auth.currentUser;
  if (!user) return;

  // ❌ already voted
  if (roomData.votedUsers?.includes(user.email)) {
    alert("You already voted");
    return;
  }

  const ref = doc(db, "classrooms", id);

  await updateDoc(ref, {
    dislikes: increment(1),
    votedUsers: [...(roomData.votedUsers || []), user.email]
  });
};

  return (
    <div>
      <span style={{ display: "none" }}>{tick}</span>
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

    <div
  style={{
    fontSize: "12px",
    color: "gray",
    position: "absolute",
    bottom: "10px",
    right: "15px",
    textAlign: "right"
  }}
>
  <div>{getTimeLeft(r.expiresAt)}</div>
  <div>Expires at {formatExpiryTime(r.expiresAt)}</div>
</div>

    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  
  <button
    onClick={() => handleLike(r.id, r)}
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
    onClick={() => handleDislike(r.id, r)}
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