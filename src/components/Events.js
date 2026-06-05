import { useState, useEffect } from "react";
import AddEvent from "./AddEvent";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc as removeDoc
} from "firebase/firestore";

import { auth, db } from "../firebase";

export default function Events({

  darkMode,

  showSavedEvents,

  setShowSavedEvents

}) {

  const [showAddEvent, setShowAddEvent] =
    useState(false);
    const [events, setEvents] = useState([]);
    const [savedEvents, setSavedEvents] =
    useState([]);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] =
  useState("today");

const [typeFilter, setTypeFilter] =
  useState("all");

const [feeFilter, setFeeFilter] =
  useState("all");
  const [tempDateFilter, setTempDateFilter] =
  useState("today");

const [tempTypeFilter, setTempTypeFilter] =
  useState("all");

const [tempFeeFilter, setTempFeeFilter] =
  useState("all");

const [selectedDate, setSelectedDate] =
  useState("");
  const [showFilters, setShowFilters] =
  useState(false);
    const [editingEvent, setEditingEvent] =
    useState(null);

  // ✅ Check admin mode
  const isAdminMode =
    localStorage.getItem("isAdminMode") === "true";


    const handleSaveEvent = async (eventId) => {

  const user = auth.currentUser;

  if (!user) return;

  const docId =
    `${user.uid}_${eventId}`;

  try {

    if (
      savedEvents.includes(eventId)
    ) {

      await removeDoc(
        doc(db, "savedEvents", docId)
      );

      setSavedEvents(
        savedEvents.filter(
          (id) => id !== eventId
        )
      );

    } else {

      await setDoc(
        doc(db, "savedEvents", docId),
        {
          userId: user.uid,
          eventId,
          savedAt: new Date()
        }
      );

      setSavedEvents([
        ...savedEvents,
        eventId
      ]);

    }

  } catch (err) {

    alert(err.message);

  }

};

    const handleDelete = async (id) => {

  const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this event?"
    );

  if (!confirmDelete) return;

  try {

    await deleteDoc(doc(db, "events", id));

    alert("Event deleted successfully");

  } catch (err) {

    alert(err.message);

  }

};

  const handleUpdateEvent = async () => {
    // ✅ Required field validation
if (
  !editingEvent.eventName ||
  !editingEvent.clubName ||
  !editingEvent.venue ||
  !editingEvent.date ||
  !editingEvent.time ||
  !editingEvent.description
) {

  alert("Please fill all required fields");

  return;

}

  try {

    await updateDoc(

      doc(db, "events", editingEvent.id),

      {

        eventName:
          editingEvent.eventName,

        clubName:
          editingEvent.clubName,

        venue:
          editingEvent.venue,

        date:
          editingEvent.date,

        time:
          editingEvent.time,

        type:
          editingEvent.type,

        description:
          editingEvent.description,

        link:
          editingEvent.link || "",

        fee:
          editingEvent.fee || "0",

        image:
          editingEvent.image

      }

    );

    alert("Event updated successfully!");

    setEditingEvent(null);

  } catch (err) {

    alert(err.message);

  }

};


    useEffect(() => {

  const unsubscribe = onSnapshot(

    collection(db, "events"),

    (snapshot) => {

      const today = new Date();

// ✅ set today to midnight
today.setHours(0, 0, 0, 0);

const data = snapshot.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))

  // ✅ hide expired events
  .filter((event) => {

  if (!event.date) return false;

  // Today's date at 12 AM
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Event date
  const eventDate = new Date(event.date);

  // Move to NEXT DAY midnight
  eventDate.setDate(eventDate.getDate() + 1);
  eventDate.setHours(0, 0, 0, 0);

  // Keep only future-valid events
  return eventDate > today;

})

      setEvents(data);
      
      const loadSavedEvents = async () => {

  const user = auth.currentUser;

  if (!user) return;

  const q = query(
    collection(db, "savedEvents"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  const savedIds =
    snapshot.docs.map(
      (doc) => doc.data().eventId
    );

  setSavedEvents(savedIds);

};

loadSavedEvents();

    }

  );

  return () => unsubscribe();

}, []);

  return (

    <div style={{
      padding: "20px",
      position: "relative"
    }}>

      <h2>

  {showSavedEvents
    ? "⭐ Saved Events"
    : "Campus Events"}

</h2>

  {showSavedEvents && (

  <button

    onClick={() =>
      setShowSavedEvents(false)
    }

    style={{

      marginBottom: "15px",

      padding: "8px 14px",

      border: "none",

      borderRadius: "8px",

      background: "#007bff",

      color: "white",

      cursor: "pointer"

    }}
  >
    ← Back to Events
  </button>

)}
      <div style={{

  display: "flex",

  gap: "15px",

  alignItems: "center",

  marginTop: "20px",

  marginBottom: "30px",

  flexWrap: "wrap"

}}>

  {/* 🔍 SEARCH */}
  <input
    type="text"

    placeholder={
  showSavedEvents
    ? "🔍 Search saved events..."
    : "🔍 Search events, club, venue..."
}

    value={search}

    onChange={(e) =>
      setSearch(e.target.value)
    }

    style={{

      flex: 1,

      minWidth: "260px",

      padding: "14px",

      borderRadius: "12px",

      border:
        darkMode
          ? "1px solid #444"
          : "1px solid #ccc",

      background:
        darkMode ? "#1e1e2f" : "white",

      color:
        darkMode ? "white" : "black",

      fontSize: "15px",

      outline: "none"

    }}
  />

{/* 🎯 FILTER */}
{!showSavedEvents && (

<div style={{ position: "relative" }}>

<button

  onClick={() =>
    setShowFilters(!showFilters)
  }

  style={{
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#007bff",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  }}
>
  ⚙️ Filter
</button>

{showFilters && (

<div style={{

  position: "absolute",

  top: "50px",

  right: 0,

  width: "250px",

  background:
    darkMode ? "#2c2c3e" : "white",

  padding: "15px",

  borderRadius: "12px",

  boxShadow:
  "0 4px 15px rgba(0,0,0,0.15)",

  zIndex: 1000
  

}}>
  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "10px"
  }}
>
  <h3
    style={{
      margin: 0,
      fontSize: "18px"
    }}
  >
    ⚙️ Filter Events
  </h3>

  <button
  onClick={() => setShowFilters(false)}
  style={{
    border: "none",
    background: "transparent",
    fontSize: "22px",
    fontWeight: "bold",
    cursor: "pointer",

    color: darkMode
      ? "#ffffff"
      : "#111827"
  }}
>
  ✕
</button>
</div>

 <h4 style={{
  marginTop: "12px",
  marginBottom: "5px",
  fontSize: "14px"
}}>
  📅 Date
</h4>

  {/* DATE FILTER */}
<select
  value={tempDateFilter}
  onChange={(e) =>
    setTempDateFilter(e.target.value)
  }
  style={{
  ...filterStyle,
  width: "100%"
}}
>
  <option value="today">
    Today's Events
  </option>

  <option value="all">
    All Events
  </option>

  <option value="selected">
    Select Date
  </option>
</select>

{/* 📅 DATE PICKER */}
  {tempDateFilter === "selected" && (

    <input

      type="date"

      autoFocus

      value={selectedDate}

      onChange={(e) => {

  setSelectedDate(e.target.value);

}}

      style={{

        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",

        padding: "8px",

        borderRadius: "12px",
        width: "100%",
boxSizing: "border-box",
marginTop: "5px",

        border:
          darkMode
            ? "1px solid #444"
            : "1px solid #ccc",

        background:
          darkMode ? "#1e1e2f" : "white",

        color:
          darkMode ? "white" : "black",

        fontSize: "15px",

        outline: "none",

        // zIndex: 1000

      }}
    />

  )}

<h4 style={{
  marginTop: "12px",
  marginBottom: "5px",
  fontSize: "14px"
}}>
  🏷️ Event Type
</h4>

{/* TYPE FILTER */}
<select
  value={tempTypeFilter}
  onChange={(e) => {

  setTempTypeFilter(e.target.value);

}}
  style={{
  ...filterStyle,
  width: "100%"
}}
>
  <option value="all">
    All Types
  </option>

  <option value="Technical">
    Technical
  </option>

  <option value="Non-Technical">
    Non-Technical
  </option>
</select>


<h4 style={{
  marginTop: "12px",
  marginBottom: "5px",
  fontSize: "14px"
}}>
  💰 Fee
</h4>

{/* FEE FILTER */}
<select
  value={tempFeeFilter}
  onChange={(e) => {

  setTempFeeFilter(e.target.value);

}}
  style={{
  ...filterStyle,
  width: "100%"
}}
>
  <option value="all">
    All Fees
  </option>

  <option value="free">
    Free Events
  </option>

  <option value="paid">
    Paid Events
  </option>
</select>

<button

  onClick={() => {

  setDateFilter(tempDateFilter);

  setTypeFilter(tempTypeFilter);

  setFeeFilter(tempFeeFilter);

  if (tempDateFilter !== "selected") {

    setSelectedDate("");

  }

  setShowFilters(false);

}}

  style={{

    width: "100%",

    marginTop: "10px",

    marginBottom: "10px",

    padding: "10px",
    fontSize: "14px",

    borderRadius: "8px",

    border: "none",

    background: "#28a745",

    color: "white",

    cursor: "pointer",

    fontWeight: "bold"

  }}
>
  ✅ Apply Filters
</button>
<button

  onClick={() => {

  setDateFilter("today");
  setTypeFilter("all");
  setFeeFilter("all");

  setTempDateFilter("today");
  setTempTypeFilter("all");
  setTempFeeFilter("all");

  setSelectedDate("");

  setSearch("");
  setShowFilters(false);

}}

  style={{

    width: "100%",

    marginTop: "10px",

    padding: "10px",
    fontSize: "14px",

    borderRadius: "8px",

    border: "none",

    background: "#dc3545",

    color: "white",

    cursor: "pointer",

    fontWeight: "bold"

  }}
>
  🔄 Reset Filters
</button>

<hr style={{ marginTop: "20px" }} />

<p
  style={{
    textAlign: "center",
    color: "#888",
    fontSize: "11px"
  }}
>
  💡 Filters help you find events quickly.
</p>

  

</div>

)}

</div>

)}

</div>

      {events.length === 0 ? (

  <p>No events available</p>

) : (
  
  
 [...events]

.sort(
  (a, b) =>
    new Date(a.date) -
    new Date(b.date)
)

.filter((event) => {

  const searchText =
    search.toLowerCase();

  // 🔍 SEARCH FILTER
  const matchesSearch = (

    event.eventName
      ?.toLowerCase()
      .includes(searchText)

    ||

    event.clubName
      ?.toLowerCase()
      .includes(searchText)

    ||

    event.venue
      ?.toLowerCase()
      .includes(searchText)

  );

  let matchesSaved = true;

if (
  showSavedEvents &&
  !savedEvents.includes(event.id)
) {
  matchesSaved = false;
}

  // 📅 TODAY DATE
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  // 🎯 FILTER CONDITIONS
  let matchesFilter = true;

// DATE FILTER
if (
  !showSavedEvents &&
  dateFilter === "today" &&
  event.date !== today
) {
  matchesFilter = false;
}

if (
  !showSavedEvents &&
  dateFilter === "selected" &&
  event.date !== selectedDate
) {
  matchesFilter = false;
}

// TYPE FILTER
if (
  typeFilter !== "all" &&
  event.type !== typeFilter
) {
  matchesFilter = false;
}

// FEE FILTER
if (
  feeFilter === "free" &&
  Number(event.fee || 0) > 0
) {
  matchesFilter = false;
}

if (
  feeFilter === "paid" &&
  Number(event.fee || 0) === 0
) {
  matchesFilter = false;
}

  return (
  matchesSearch &&
  matchesFilter &&
  matchesSaved
);

})

.map((event) => {

const today = new Date();

today.setHours(0,0,0,0);

const eventDate =
  new Date(event.date);

eventDate.setHours(0,0,0,0);

const diffDays =
(
  eventDate - today
)
/
(
  1000 * 60 * 60 * 24
);

return (

  <div
    key={event.id}
    style={{
      background:
        darkMode ? "#2c2c3e" : "white",

      color:
        darkMode ? "white" : "black",

      borderRadius: "18px",

      overflow: "hidden",

      marginBottom: "30px",

      boxShadow:
        "0 8px 25px rgba(0,0,0,0.12)"
    }}
  >


    {/* 📦 CONTENT */}
<div style={{
  display: "flex",
  gap: "25px",
  padding: "22px",
  flexWrap: "wrap",
  alignItems: "center"
}}>
    {/* 🖼️ LEFT IMAGE */}
{event.image && (

  <img
    src={event.image}
    alt="event"
    style={{
      width: "260px",
      height: "180px",
      objectFit: "cover",
      borderRadius: "14px",
      boxShadow:
        "0 4px 12px rgba(0,0,0,0.15)",
      flexShrink: 0
    }}
  />

)}


<div style={{ flex: 1 }}>
      {/* TITLE + TYPE */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
        flexWrap: "wrap",
        gap: "10px"
      }}>

        <h2 style={{
          margin: 0,
          fontSize: "30px"
        }}>
          {event.eventName}
        </h2>

        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "12px"
  }}
>

  {diffDays === 0 && (

  <span
    style={{
      background: "#16a34a",
      color: "white",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold"
    }}
  >
    TODAY
  </span>

)}

{diffDays === 1 && (

  <span
    style={{
      background: "#f59e0b",
      color: "white",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "bold"
    }}
  >
    TOMORROW
  </span>

)}
  <span
    style={{
      background:
        event.type === "Technical"
          ? "#0F766E"
          : "#7C3AED",

      color: "white",

      padding: "6px 14px",

      borderRadius: "20px",

      fontSize: "13px",

      fontWeight: "bold"
    }}
  >
    {event.type}
  </span>

  <button

    onClick={() =>
      handleSaveEvent(event.id)
    }

    style={{
      background: "transparent",
      border: "none",
      fontSize: "28px",
      cursor: "pointer"
    }}
  >
    {savedEvents.includes(event.id)
      ? "★"
      : "☆"}
  </button>

</div>

      </div>

      {/* CLUB */}
      <p style={{
        marginBottom: "10px",
        fontSize: "16px"
      }}>
        🏛️ <b>Club:</b> {event.clubName}
      </p>

      {/* VENUE */}
      <p style={{
        marginBottom: "10px",
        fontSize: "16px"
      }}>
        📍 <b>Venue:</b> {event.venue}
      </p>

      {/* DATE + TIME */}
      <div style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "15px"
      }}>

        <p style={{ margin: 0 }}>
          📅 <b>Date:</b> {event.date}
        </p>

        <p style={{ margin: 0 }}>
          ⏰ <b>Time:</b> {event.time}
        </p>

      </div>

      {/* FEE */}
      <p style={{
        marginBottom: "15px",
        fontSize: "16px"
      }}>
        💰 <b>Fee:</b> ₹{event.fee || 0}
      </p>

      {/* DESCRIPTION */}
      <div
        style={{
          background:
            darkMode ? "#1e1e2f" : "#f5f5f5",

          padding: "15px",

          borderRadius: "10px",

          lineHeight: "1.6",

          marginBottom: "20px"
        }}
      >
        {event.description}
      </div>

      

      {/* 🚀 BUTTON ROW */}
<div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flexWrap: "wrap",
  gap: "15px",
  marginTop: "20px"
}}>

  {/* REGISTER BUTTON */}
{event.link && (

  <div style={{ marginRight: "auto" }}>

    <a
      href={event.link}
      target="_blank"
      rel="noreferrer"

      style={{
        display: "inline-block",
        background: "#007bff",
        color: "white",
        padding: "12px 20px",
        borderRadius: "10px",
        textDecoration: "none",
        fontWeight: "bold"
      }}
    >
      Register Now
    </a>

  </div>

)}

  {/* 🛠️ ADMIN ACTIONS */}
  {isAdminMode && (

    <div style={{
      display: "flex",
      gap: "12px"
    }}>

    {/* ✏️ EDIT */}
    <button
      style={{
        background: "#ff9800",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold"
      }}

      onClick={() => {

  setEditingEvent(event);

}}
    >
      ✏️ Edit
    </button>

    {/* 🗑️ DELETE */}
    <button
      style={{
        background: "#f44336",
        color: "white",
        border: "none",
        padding: "10px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold"
      }}

      onClick={() => handleDelete(event.id)}
    >
      🗑️ Delete
    </button>

  </div>

)}
    </div>
    </div>
    </div>
  </div>

);

})

)}

      {/* ➕ ADMIN ONLY BUTTON */}
      {isAdminMode && (

        <button
          onClick={() => setShowAddEvent(true)}
          style={{
            position: "fixed",
            bottom: "25px",
            right: "25px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            fontSize: "28px",
            background: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer"
          }}
        >
          +
        </button>

      )}

      {/* 📦 POPUP */}
      {showAddEvent && (

        <div
          onClick={() => setShowAddEvent(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background:
                darkMode ? "#2c2c3e" : "white",
              color:
                darkMode ? "white" : "black",
              padding: "25px",
              borderRadius: "12px",
              width: "420px",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >

            <AddEvent
  darkMode={darkMode}
  onClose={() => setShowAddEvent(false)}
/>

          </div>

        </div>

      )}
        
        {/* ✏️ EDIT POPUP */}
{editingEvent && (

  <div
    onClick={() => setEditingEvent(null)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}
  >

    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background:
          darkMode ? "#2c2c3e" : "white",

        color:
          darkMode ? "white" : "black",

        padding: "25px",

        borderRadius: "12px",

        width: "420px",

        maxHeight: "90vh",

        overflowY: "auto"
      }}
    >

      <h2
  style={{
    textAlign: "center",
    marginBottom: "20px"
  }}
>
  Edit Event
</h2>

      <label style={editLabel}>
        Event Name <span style={{ color: "red" }}>*</span>
      </label>
      <input
  value={editingEvent.eventName}
  placeholder="Event Name"

  onChange={(e) =>
    setEditingEvent({
      ...editingEvent,
      eventName: e.target.value
    })
  }

  style={editInput(darkMode)}
/>

<label style={editLabel}>
  Club Name <span style={{ color: "red" }}>*</span>
</label>
<input
  value={editingEvent.clubName}
  placeholder="Club Name"

  onChange={(e) =>
    setEditingEvent({
      ...editingEvent,
      clubName: e.target.value
    })
  }

  style={editInput(darkMode)}
/>


<label style={editLabel}>
  Venue <span style={{ color: "red" }}>*</span>
</label>

<input
  value={editingEvent.venue}
  placeholder="Venue"

  onChange={(e) =>
    setEditingEvent({
      ...editingEvent,
      venue: e.target.value
    })
  }

  style={editInput(darkMode)}
/>

<label style={editLabel}>
  Date <span style={{ color: "red" }}>*</span>
</label>

<input
  type="date"

  value={editingEvent.date}

  onChange={(e) =>
    setEditingEvent({
      ...editingEvent,
      date: e.target.value
    })
  }

  style={editInput(darkMode)}
/>


<label style={editLabel}>
  Time <span style={{ color: "red" }}>*</span>
</label>

<input
  type="time"

  value={editingEvent.time}

  onChange={(e) =>
    setEditingEvent({
      ...editingEvent,
      time: e.target.value
    })
  }

  style={editInput(darkMode)}
/>


<label style={editLabel}>
  Event Type <span style={{ color: "red" }}>*</span>
</label>

<select
  value={editingEvent.type}

  onChange={(e) =>
    setEditingEvent({
      ...editingEvent,
      type: e.target.value
    })
  }

  style={editInput(darkMode)}
>
  <option>Technical</option>
  <option>Non-Technical</option>
</select>


<label style={editLabel}>
  Description <span style={{ color: "red" }}>*</span>
</label>

<textarea
  value={editingEvent.description}
  placeholder="Description"

  onChange={(e) =>
    setEditingEvent({
      ...editingEvent,
      description: e.target.value
    })
  }

  style={{
    ...editInput(darkMode),
    height: "120px",
    resize: "none"
  }}
/>

<label style={editLabel}>
  Registration Link
</label>

<input
  value={editingEvent.link || ""}
  placeholder="Registration Link"

  onChange={(e) =>
    setEditingEvent({
      ...editingEvent,
      link: e.target.value
    })
  }

  style={editInput(darkMode)}
/>


<label style={editLabel}>
  Entry Fee
</label>

<input
  value={editingEvent.fee || ""}
  placeholder="Entry Fee"

  onChange={(e) =>
    setEditingEvent({
      ...editingEvent,
      fee: e.target.value
    })
  }

  style={editInput(darkMode)}
/>

{/* 🖼️ IMAGE CHANGE */}
<label style={editLabel}>
  Event Image <span style={{ color: "red" }}>*</span>
</label>
<input
  type="file"
  accept="image/*"

  onChange={(e) => {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {

      setEditingEvent({
        ...editingEvent,
        image: reader.result
      });

    };

    reader.readAsDataURL(file);

  }}

  style={editInput(darkMode)}
/>

      <button
        onClick={handleUpdateEvent}

        style={{
          width: "100%",
          padding: "12px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Save Changes
      </button>

    </div>

  </div>

)}
    </div>

  );

}

const editLabel = {
  fontWeight: "bold",
  marginBottom: "6px",
  display: "block"
};

const editInput = (darkMode) => ({

  width: "100%",
  padding: "12px",
  marginBottom: "12px",

  borderRadius: "8px",

  border: darkMode
    ? "1px solid #777"
    : "1px solid #ccc",

  background: darkMode
    ? "#444"
    : "white",

  color: darkMode
    ? "white"
    : "black",

  boxSizing: "border-box",

  outline: "none"

});

const filterStyle = {

  padding: "12px",

  borderRadius: "12px",

  border: "1px solid #ccc",

  fontSize: "15px",

  minWidth: "160px",

  boxSizing: "border-box"

};