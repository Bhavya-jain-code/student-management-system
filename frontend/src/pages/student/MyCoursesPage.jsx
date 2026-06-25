import { useEffect, useState } from "react";
import api from "../../services/axiosInstance";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const studentId = localStorage.getItem("student_id"); // ✅ FIXED

        if (!studentId) {
          console.log("No student ID found");
          setLoading(false);
          return;
        }

        const res = await api.get(
          `/student/${studentId}/courses`
        );

        setCourses(res.data || []);
      } catch (err) {
        console.log("Courses Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ margin: 0 }}>📚 My Courses</h1>
        <p style={{ marginTop: "10px", opacity: 0.9 }}>
          View all courses you are currently enrolled in.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={loadingStyle}>
          <h3>Loading Courses...</h3>
        </div>
      )}

      {/* Empty */}
      {!loading && courses.length === 0 && (
        <div style={emptyStyle}>
          <h2>📭 No Courses Found</h2>
          <p>You are not enrolled in any course yet.</p>
        </div>
      )}

      {/* Cards */}
      {!loading && courses.length > 0 && (
        <div style={gridStyle}>
          {courses.map((course, index) => (
            <div key={course.id || index} style={cardStyle}>
              <div style={iconStyle}>📘</div>

              <h3 style={titleStyle}>{course.title}</h3>

              <p style={textStyle}>
                Student: <strong>{course.name}</strong>
              </p>

              <div style={badgeStyle}>Active Course</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =======================
   STYLES (same as yours)
======================= */

const containerStyle = {
  padding: "30px",
  background: "#f4f7fc",
  minHeight: "100vh",
};

const headerStyle = {
  background: "linear-gradient(135deg, #2563eb, #1e40af)",
  color: "white",
  padding: "30px",
  borderRadius: "15px",
  marginBottom: "30px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
  gap: "20px",
};

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "16px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  transition: "0.3s",
  border: "1px solid #e5e7eb",
};

const iconStyle = {
  fontSize: "40px",
  marginBottom: "15px",
};

const titleStyle = {
  margin: "0 0 10px",
  color: "#1f2937",
};

const textStyle = {
  color: "#6b7280",
  marginBottom: "15px",
};

const badgeStyle = {
  display: "inline-block",
  background: "#dcfce7",
  color: "#166534",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "14px",
  fontWeight: "600",
};

const emptyStyle = {
  background: "white",
  textAlign: "center",
  padding: "50px",
  borderRadius: "15px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
};

const loadingStyle = {
  textAlign: "center",
  padding: "40px",
};