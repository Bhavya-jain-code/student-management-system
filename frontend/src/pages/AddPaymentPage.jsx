import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

function AddPaymentPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    enrollment_id: "",
    amount: "",
    payment_date: today,
  });

  useEffect(() => {
    loadEnrollments();
  }, []);

  async function loadEnrollments() {
    try {
      const res = await api.get("/enrollments");
      setEnrollments(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

async function handleSubmit(e) {
  e.preventDefault();

  const enrollmentId = Number(formData.enrollment_id);
  const amountValue = Number(formData.amount);

  if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
    alert("Please select a valid student and course.");
    return;
  }

  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    alert("Please enter a valid payment amount.");
    return;
  }

  try {
    setLoading(true);

    await api.post("/payments", {
      enrollment_id: enrollmentId,
      amount: amountValue,
      payment_date: formData.payment_date || today,
      status: "paid",
    });

    alert("Payment Added Successfully");

    setFormData({
      enrollment_id: "",
      amount: "",
      payment_date: today,
      status: "paid",
    });
  } catch (error) {
    console.error(error);
    alert(error?.response?.data?.error || "Error");
  } finally {
    setLoading(false);
  }
}

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>💳 Add Payment</h2>
          <p style={subTitleStyle}>
            Record student payment quickly and securely.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>

          <div>
            <label style={labelStyle}>Student & Course</label>
            <select
              name="enrollment_id"
              value={formData.enrollment_id}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">Select Student</option>

              {enrollments.map((item) => (
                <option
                  key={item.id || item.enrollment_id}
                  value={item.id || item.enrollment_id}
                >
                  {item.student_name} • {item.course_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Amount (₹)</label>
            <input
              type="number"
              name="amount"
              placeholder="Enter payment amount"
              value={formData.amount}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Payment Date</label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={btnStyle}
            disabled={loading}
          >
            {loading ? "Saving..." : "💰 Save Payment"}
          </button>

        </form>
      </div>
    </div>
  );
}

/* ===================== Styles ===================== */

const containerStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg,#eef2ff,#dbeafe)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "30px",
};

const cardStyle = {
  width: "100%",
  maxWidth: "520px",
  background: "#fff",
  borderRadius: "20px",
  padding: "35px",
  boxShadow: "0 15px 40px rgba(0,0,0,.12)",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "30px",
};

const titleStyle = {
  margin: 0,
  color: "#1e3a8a",
  fontSize: "30px",
  fontWeight: "700",
};

const subTitleStyle = {
  marginTop: "8px",
  color: "#6b7280",
  fontSize: "14px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  padding: "13px 15px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  fontSize: "15px",
  boxSizing: "border-box",
};

const btnStyle = {
  marginTop: "10px",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(90deg,#2563eb,#1d4ed8)",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  transition: ".3s",
};

export default AddPaymentPage;