import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddEvent({ darkMode }) {

  const [eventName, setEventName] = useState("");
  const [clubName, setClubName] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("Technical");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [fee, setFee] = useState("");
  const [image, setImage] = useState(null);

  const handleAddEvent = async () => {

  // ✅ Validation
  if (
    !eventName ||
    !clubName ||
    !venue ||
    !date ||
    !time ||
    !description
  ) {
    alert("Please fill all required fields");
    return;
  }

  try {

    // ✅ Save event to Firestore
    await addDoc(collection(db, "events"), {

      eventName,
      clubName,
      venue,
      date,
      time,
      type,
      description,
      link,
      fee: fee || "0",
      image,

      createdAt: new Date()

    });

    alert("Event added successfully!");

    // ✅ Clear form
    setEventName("");
    setClubName("");
    setVenue("");
    setDate("");
    setTime("");
    setType("Technical");
    setDescription("");
    setLink("");
    setFee("");
    setImage("");

  } catch (err) {

    alert(err.message);

  }

};

  return (

    <div>

      <h2 style={{
        textAlign: "center",
        marginBottom: "20px"
      }}>
        Add Event
      </h2>

      <label style={labelStyle}>
  Event Name <span style={{ color: "red" }}>*</span>
</label>

<input
  placeholder="Enter event name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        style={inputStyle(darkMode)}
      />

      <label style={labelStyle}>
        Club Name <span style={{ color: "red" }}>*</span>
      </label>
      <input
        placeholder="Club Name"
        value={clubName}
        onChange={(e) => setClubName(e.target.value)}
        style={inputStyle(darkMode)}
      />

      <label style={labelStyle}>
        Venue <span style={{ color: "red" }}>*</span>
      </label>
      <input
        placeholder="Venue"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
        style={inputStyle(darkMode)}
      />


      <label style={labelStyle}>
        Date <span style={{ color: "red" }}>*</span>
      </label>
      <input
        type="date"
        min={new Date().toISOString().split("T")[0]}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={inputStyle(darkMode)}
        />


      <label style={labelStyle}>
        Time <span style={{ color: "red" }}>*</span>
      </label>
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={inputStyle(darkMode)}
      />


      <label style={labelStyle}>
        Event Type <span style={{ color: "red" }}>*</span>
      </label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={inputStyle(darkMode)}
      >
        <option>Technical</option>
        <option>Non-Technical</option>
      </select>


      <label style={labelStyle}>
        Description <span style={{ color: "red" }}>*</span>
      </label>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{
          ...inputStyle(darkMode),
          height: "100px",
          resize: "none"
        }}
      />


      <label style={labelStyle}>
        Registration Link
      </label>
      <input
        placeholder="Registration Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        style={inputStyle(darkMode)}
      />


      <label style={labelStyle}>
        Entry Fee
      </label>
      <input
        placeholder="Entry Fee"
        value={fee}
        onChange={(e) => setFee(e.target.value)}
        style={inputStyle(darkMode)}
      />


      <label style={labelStyle}>
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

      setImage(reader.result);

    };

    reader.readAsDataURL(file);

  }}

  style={inputStyle(darkMode)}
/>

      <button
        onClick={handleAddEvent}
        style={{
          width: "100%",
          padding: "12px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          marginTop: "10px"
        }}
      >
        Add Event
      </button>

    </div>

  );

}

const labelStyle = {
  fontWeight: "bold",
  marginBottom: "6px",
  display: "block"
};

const inputStyle = (darkMode) => ({
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