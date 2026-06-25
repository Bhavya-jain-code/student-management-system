import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

function AddPaymentPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
    amount: "",
    payment_date: "",
    status: "Paid",
  });

  // Load Students + Courses dynamically
  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/payments", formData);

      alert("✅ Payment Added Successfully");

      setFormData({
        student_id: "",
        course_id: "",
        amount: "",
        payment_date: "",
        status: "Paid",
      });
    } catch (error) {
      console.error(error);
      alert("❌ Error adding payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>💰 Add Payment</h1>

        <form onSubmit={handleSubmit} style={formStyle}>
          {/* STUDENT DROPDOWN */}
          <select
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* COURSE DROPDOWN */}
          <select
            name="course_id"
            value={formData.course_id}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Select Course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <input
            type="date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={inputStyle}
          >
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const containerStyle = {
  minHeight: "100vh",
  background: "#f4f7fc",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "500px",
  background: "white",
  padding: "30px",
  borderRadius: "15px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
};

const titleStyle = {
  marginBottom: "20px",
  textAlign: "center",
  color: "#1f2937",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  outline: "none",
  fontSize: "14px",
};

const btnStyle = {
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default AddPaymentPage;