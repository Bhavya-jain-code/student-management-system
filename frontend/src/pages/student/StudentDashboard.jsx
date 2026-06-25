import { useEffect, useState } from "react";
import api from "../../services/axiosInstance";

function StudentDashboard() {
  const name = localStorage.getItem("name");

  const [data, setData] = useState({
    totalCourses: 0,
    attendance: 0,
    avgMarks: 0,
    feeStatus: "Pending",
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const studentId =
        localStorage.getItem("student_id");

      console.log(
        "Student ID:",
        studentId
      );
       console.log(
      "Token:",
      localStorage.getItem("token")
    );

      if (!studentId) {
        console.error(
          "Student ID not found in localStorage"
        );
        return;
      }

      const res = await api.get(
        `/student-dashboard/${studentId}`
      );

      console.log(
        "Dashboard Data:",
        res.data
      );

      setData(res.data);
    } catch (err) {
      console.error(
        "Dashboard Error:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        background: "#f4f7fc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg,#4f46e5,#7c3aed)",
          color: "white",
          padding: "30px",
          borderRadius: "20px",
          marginBottom: "30px",
        }}
      >
        <h1>🎓 Student Dashboard</h1>

        <p
          style={{
            fontSize: "18px",
            marginTop: "10px",
          }}
        >
          Welcome back, <b>{name}</b> 👋
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg,#06b6d4,#3b82f6)",
            color: "white",
            padding: "25px",
            borderRadius: "15px",
          }}
        >
          <h3>📚 My Courses</h3>
          <h1>{data.myCourses || 0}</h1>
        </div>

        <div
          style={{
            background:
              "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "white",
            padding: "25px",
            borderRadius: "15px",
          }}
        >
          <h3>✅ Attendance</h3>
          <h1>{data.attendance || 0}%</h1>
        </div>

        <div
          style={{
            background:
              "linear-gradient(135deg,#f59e0b,#f97316)",
            color: "white",
            padding: "25px",
            borderRadius: "15px",
          }}
        >
          <h3>📊 Average Marks</h3>
          <h1>{data.avgMarks || 0}%</h1>
        </div>

        <div
          style={{
            background:
              "linear-gradient(135deg,#ec4899,#db2777)",
            color: "white",
            padding: "25px",
            borderRadius: "15px",
          }}
        >
          <h3>💰 Fee Status</h3>
          <h1>{data.feeStatus || "Pending"}</h1>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;