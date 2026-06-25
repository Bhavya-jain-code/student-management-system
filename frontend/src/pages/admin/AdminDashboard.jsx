import { useEffect, useState } from "react";
import api from "../../services/axiosInstance";

function AdminDashboard() {
  const [data, setData] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalFeeCollected: 0,
    paidFees: 0,
    pendingFees: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    
    try {
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const cardStyle = (bg) => ({
    background: bg,
    color: "white",
    padding: "25px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    transition: "0.3s",
  });

  return (
    <div
      style={{
        padding: "30px",
        background: "#f4f7fc",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          marginBottom: "25px",
          color: "#222",
        }}
      >
        🎓 Admin Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle("linear-gradient(135deg,#667eea,#764ba2)")}>
          <h3>👨‍🎓 Total Students</h3>
          <h1>{data.totalStudents}</h1>
        </div>

        <div style={cardStyle("linear-gradient(135deg,#11998e,#38ef7d)")}>
          <h3>📚 Total Courses</h3>
          <h1>{data.totalCourses}</h1>
        </div>

        <div style={cardStyle("linear-gradient(135deg,#f7971e,#ffd200)")}>
          <h3>📝 Total Enrollments</h3>
          <h1>{data.totalEnrollments}</h1>
        </div>

        <div style={cardStyle("linear-gradient(135deg,#00b09b,#96c93d)")}>
          <h3>💰 Fee Collected</h3>
          <h1>₹ {data.totalFeeCollected}</h1>
        </div>

        <div style={cardStyle("linear-gradient(135deg,#56ab2f,#a8e063)")}>
          <h3>✅ Paid Fees</h3>
          <h1>{data.paidFees}</h1>
        </div>

        <div style={cardStyle("linear-gradient(135deg,#ff416c,#ff4b2b)")}>
          <h3>⏳ Pending Fees</h3>
          <h1>{data.pendingFees}</h1>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#fff",
          padding: "25px",
          borderRadius: "18px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h2>📊 Payment Report</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "15px",
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Category
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Value
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={{ padding: "12px" }}>Total Fee Collected</td>
              <td style={{ padding: "12px" }}>
                ₹ {data.totalFeeCollected}
              </td>
            </tr>

            <tr>
              <td style={{ padding: "12px" }}>Paid Fees</td>
              <td style={{ padding: "12px" }}>
                {data.paidFees}
              </td>
            </tr>

            <tr>
              <td style={{ padding: "12px" }}>Pending Fees</td>
              <td style={{ padding: "12px" }}>
                {data.pendingFees}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#fff",
          padding: "25px",
          borderRadius: "18px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h2>📈 System Overview</h2>

        <p>
          Welcome to the Student Management System Admin Panel.
          Here you can manage students, courses, enrollments,
          attendance, fees, reports and overall institute activities.
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;