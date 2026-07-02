import { useEffect, useState } from "react";
import api from "../../services/axiosInstance";
import { getStudyAdvisor } from "../../services/studentApi";
import { Link } from "react-router-dom";

function StudentDashboard() {
  const name = localStorage.getItem("name");

  const [advisor, setAdvisor] = useState(null);

  const [data, setData] = useState({
    myCourses: 0,
    attendance: 0,
    avgMarks: 0,
    feeStatus: "Pending",
  });

  useEffect(() => {
    loadDashboard();
    loadAdvisor();
  }, []);

  const loadDashboard = async () => {
    try {
      const studentId =
        localStorage.getItem("student_id");

      if (!studentId) {
        console.error(
          "Student ID not found in localStorage"
        );
        return;
      }

      const res = await api.get(
        `/student-dashboard/${studentId}`
      );

      setData(res.data);
    } catch (err) {
      console.error(
        "Dashboard Error:",
        err.response?.data || err.message
      );
    }
  };

  const loadAdvisor = async () => {
    try {
      const studentId =
        localStorage.getItem("student_id");

      const res =
        await getStudyAdvisor(studentId);

      setAdvisor(res.data);
    } catch (err) {
      console.error(
        "Advisor Error:",
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
      {/* Header */}

      {/* Header */}

<div
  style={{
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "white",
    padding: "30px",
    borderRadius: "20px",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div>
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

  <Link
    to="/student/profile"
     className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  >
    👤 My Profile
  </Link>
</div>

      {/* Dashboard Cards */}

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
          <h1>
            {data.feeStatus || "Pending"}
          </h1>
        </div>
      </div>

      {/* Smart Study Advisor */}

      <div
        style={{
          marginTop: "30px",
          background: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow:
            "0 5px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h2>
          🤖 Smart Study Advisor
        </h2>

        {advisor ? (
          <>
            <p>
              <strong>
                Attendance:
              </strong>{" "}
              {advisor.attendance}%
            </p>

            <p>
              <strong>
                Average Marks:
              </strong>{" "}
              {advisor.avgMarks}%
            </p>

            <p>
              <strong>
                Risk Level:
              </strong>{" "}
              {advisor.riskLevel ===
              "High"
                ? "🚨 High"
                : advisor.riskLevel ===
                  "Medium"
                ? "⚠ Medium"
                : "✅ Low"}
            </p>

            <h3
              style={{
                marginTop: "15px",
              }}
            >
              Recommendations
            </h3>

            <ul>
              {advisor.tips?.map(
                (tip, index) => (
                  <li key={index}>
                    {tip}
                  </li>
                )
              )}
            </ul>
          </>
        ) : (
          <p>Loading Advisor...</p>
        )}
      </div>
   


    </div>
  );
}

export default StudentDashboard;