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
  increment,
  deleteField
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

const getBlockIcon = (block) => {
  switch (block) {
    case "AB1":
      return "🏫";

    case "AB2":
      return "🏢";

    case "CB":
      return "🏬";

    default:
      return "🏫";
  }
};
  const handleLike = async (id, roomData) => {
  const user = auth.currentUser;

  if (!user) return;

  const voteKey = user.uid;

  const currentVote = roomData.userVotes?.[voteKey];

  const ref = doc(db, "classrooms", id);

  if (currentVote === "like") {

    // remove like
    await updateDoc(ref, {
      likes: increment(-1),
      [`userVotes.${voteKey}`]: deleteField()
    });

  } else if (currentVote === "dislike") {

    // dislike -> like
    await updateDoc(ref, {
      dislikes: increment(-1),
      likes: increment(1),
      [`userVotes.${voteKey}`]: "like"
    });

  } else {

    // first like
    await updateDoc(ref, {
      likes: increment(1),
      [`userVotes.${voteKey}`]: "like"
    });

  }
};


const handleDislike = async (id, roomData) => {
  const user = auth.currentUser;

  if (!user) return;

  const voteKey = user.uid;

  const currentVote = roomData.userVotes?.[voteKey];

  const ref = doc(db, "classrooms", id);

  if (currentVote === "dislike") {

    // remove dislike
    await updateDoc(ref, {
      dislikes: increment(-1),
      [`userVotes.${voteKey}`]: deleteField()
    });

  } else if (currentVote === "like") {

    // like -> dislike
    await updateDoc(ref, {
      likes: increment(-1),
      dislikes: increment(1),
      [`userVotes.${voteKey}`]: "dislike"
    });

  } else {

    // first dislike
    await updateDoc(ref, {
      dislikes: increment(1),
      [`userVotes.${voteKey}`]: "dislike"
    });

  }
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

  background: darkMode
    ? "#2c2c3e"
    : "linear-gradient(180deg,#ffffff,#fafcff)",

  color: darkMode ? "white" : "black",

  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
  border: "1px solid #eef2ff",

  padding: "20px",
  minHeight: "110px",
  marginBottom: "15px",
  borderRadius: "14px"
}}
  >
    <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}
>
  <div>
    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px"
  }}
>
  <div
    style={{
      width: "42px",
      height: "42px",
      borderRadius: "50%",
      background: "#eff6ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px"
    }}
  >
    {getBlockIcon(r.block)}
  </div>

  <h3
    style={{
      margin: 0,
      fontSize: "22px",
      fontWeight: "700"
    }}
  >
    {r.block} - {r.room}
  </h3>
</div>

    <p
      style={{
        marginTop: "6px",
        color: "#64748b",
        fontSize: "14px"
      }}
    >
      Available classroom reported by students
    </p>
    <div
  style={{
    display: "inline-block",
    background: "#dcfce7",
    color: "#16a34a",
    padding: "5px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    marginTop: "6px"
  }}
>
  🟢 Available Now
</div>
  </div>
</div>

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
  <div>
  ⌛ {getTimeLeft(r.expiresAt).replace("⏳","")}
</div>

<div>
  🕒 Until {formatExpiryTime(r.expiresAt)}
</div>
</div>

    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  
  <button
  onClick={() => handleLike(r.id, r)}

  onMouseEnter={(e)=>{
    e.currentTarget.style.transform="translateY(-2px)";
  }}

  onMouseLeave={(e)=>{
    e.currentTarget.style.transform="translateY(0px)";
  }}
    style={{
  display: "flex",
  alignItems: "center",
  gap: "8px",

  background:
    r.userVotes?.[auth.currentUser?.uid] === "like"
      ? "#dcfce7"
      : "#f8fafc",

  color:
    r.userVotes?.[auth.currentUser?.uid] === "like"
      ? "#16a34a"
      : "#475569",

  border:
    r.userVotes?.[auth.currentUser?.uid] === "like"
      ? "1px solid #16a34a"
      : "1px solid #e2e8f0",

  padding: "12px 20px",
  borderRadius: "50px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "15px",
  transition: "all .2s ease"
}}
  >
    ✓ Available {r.likes || 0}
  </button>

  <button
  onClick={() => handleDislike(r.id, r)}

  onMouseEnter={(e)=>{
    e.currentTarget.style.transform="translateY(-2px)";
  }}

  onMouseLeave={(e)=>{
    e.currentTarget.style.transform="translateY(0px)";
  }}
    style={{
  display: "flex",
  alignItems: "center",
  gap: "8px",

  background:
    r.userVotes?.[auth.currentUser?.uid] === "dislike"
      ? "#fee2e2"
      : "#f8fafc",

  color:
    r.userVotes?.[auth.currentUser?.uid] === "dislike"
      ? "#dc2626"
      : "#475569",

  border:
    r.userVotes?.[auth.currentUser?.uid] === "dislike"
      ? "1px solid #dc2626"
      : "1px solid #e2e8f0",

  padding: "12px 20px",
  borderRadius: "50px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "15px",
  transition: "all .2s ease"
}}
  >
    ✕ Not Available {r.dislikes || 0}
  </button>

</div>

  </div>
))
        )}
    </div>
    );
}