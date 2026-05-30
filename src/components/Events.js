import { useState, useEffect } from "react";
import AddEvent from "./AddEvent";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import { db } from "../firebase";

export default function Events({ darkMode }) {

  const [showAddEvent, setShowAddEvent] =
    useState(false);
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] =
  useState("today");

const [selectedDate, setSelectedDate] =
  useState("");
    const [editingEvent, setEditingEvent] =
    useState(null);

  // ✅ Check admin mode
  const isAdminMode =
    localStorage.getItem("isAdminMode") === "true";

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

    }

  );

  return () => unsubscribe();

}, []);

  return (

    <div style={{
      padding: "20px",
      position: "relative"
    }}>

      <h2>Campus Events</h2>
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

    placeholder="🔍 Search events, club, venue..."

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
<div style={{

  display: "flex",

  alignItems: "center",

  gap: "12px"

}}>

  <select

    value={filter}

    onChange={(e) => {

      setFilter(e.target.value);

    }}

    style={{

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

      minWidth: "190px",

      fontSize: "15px",

      outline: "none"

    }}
  >

    <option value="today">
      Today's Events
    </option>

    <option value="all">
      All Events
    </option>

    <option value="technical">
      Technical
    </option>

    <option value="nontechnical">
      Non-Technical
    </option>

    <option value="free">
      Free Events
    </option>

    <option value="paid">
      Paid Events
    </option>

    <option value="date">
      Select Date
    </option>

  </select>

  {/* 📅 DATE PICKER */}
  {filter === "date" && (

    <input

      type="date"

      autoFocus

      value={selectedDate}

      onChange={(e) =>
        setSelectedDate(e.target.value)
      }

      style={{

        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",

        padding: "12px",

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

        outline: "none",

        // zIndex: 1000

      }}
    />

  )}

</div>
  

</div>

      {events.length === 0 ? (

  <p>No events available</p>

) : (

  events

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

  // 📅 TODAY DATE
  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  // 🎯 FILTER CONDITIONS
  let matchesFilter = true;

  if (filter === "today") {

    matchesFilter =
      event.date === today;

  }

  else if (filter === "technical") {

    matchesFilter =
      event.type === "Technical";

  }

  else if (
    filter === "nontechnical"
  ) {

    matchesFilter =
      event.type === "Non-Technical";

  }

  else if (filter === "free") {

    matchesFilter =
      !event.fee ||
      Number(event.fee) === 0;

  }

  else if (filter === "paid") {

    matchesFilter =
      Number(event.fee) > 0;

  }

  else if (
    filter === "date"
  ) {

    matchesFilter =
      event.date === selectedDate;

  }

  return (
    matchesSearch &&
    matchesFilter
  );

})

.map((event) => (

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

))

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

            <AddEvent darkMode={darkMode} />

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

      <h2>Edit Event</h2>

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

  style={editInput}
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

  style={editInput}
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

  style={editInput}
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

  style={editInput}
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

  style={editInput}
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

  style={editInput}
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
    ...editInput,
    height: "120px"
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

  style={editInput}
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

  style={editInput}
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

  style={editInput}
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

const editInput = {

  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box"

};