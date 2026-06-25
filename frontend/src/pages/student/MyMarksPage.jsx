import { useEffect, useState } from "react";
import { getStudentMarks } from "../../services/studentApi";

function MarksPage() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarks = async () => {
      try {
        const studentId = localStorage.getItem("student_id");

        console.log("Student ID:", studentId); // 🔍 DEBUG

        if (!studentId) {
          console.log("No student id found in localStorage");
          setMarks([]);
          setLoading(false);
          return;
        }

        const res = await getStudentMarks(studentId);

        console.log("API Response:", res.data); // 🔍 DEBUG

        // ✅ SAFE HANDLING (IMPORTANT FIX)
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];

        setMarks(data);
      } catch (err) {
        console.log("Marks Error:", err);
        setMarks([]);
      } finally {
        setLoading(false);
      }
    };

    loadMarks();
  }, []);

  return (
    <div style={container}>
      {/* Header */}
      <div style={header}>
        <h1 style={{ margin: 0 }}>📝 My Marks</h1>
        <p style={{ marginTop: 10 }}>
          Track your academic performance and course-wise scores.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={loadingBox}>
          <h3>Loading Marks...</h3>
        </div>
      )}

      {/* Empty */}
      {!loading && marks.length === 0 && (
        <div style={emptyBox}>
          <h2>📭 No Marks Available</h2>
          <p>Your marks have not been uploaded yet.</p>
        </div>
      )}

      {/* Cards */}
      {!loading && marks.length > 0 && (
        <div style={grid}>
          {marks.map((m, index) => (
            <div key={m.id || index} style={card}>
              <div style={icon}>📚</div>

              <h2 style={courseTitle}>
                {m.course_name || "Course"}
              </h2>

              <div style={infoBox}>
                <p>
                  <strong>Obtained:</strong>{" "}
                  {m.marks_obtained ?? 0}
                </p>

                <p>
                  <strong>Total:</strong>{" "}
                  {m.total_marks ?? 0}
                </p>
              </div>

              <div style={percentageContainer}>
                <div style={percentageCircle}>
                  {Number(m.percentage || 0).toFixed(2)}%
                </div>
              </div>

              <div
                style={{
                  ...badge,
                  background:
                    (m.percentage || 0) >= 75
                      ? "#dcfce7"
                      : (m.percentage || 0) >= 50
                      ? "#fef3c7"
                      : "#fee2e2",

                  color:
                    (m.percentage || 0) >= 75
                      ? "#166534"
                      : (m.percentage || 0) >= 50
                      ? "#92400e"
                      : "#991b1b",
                }}
              >
                {(m.percentage || 0) >= 75
                  ? "Excellent"
                  : (m.percentage || 0) >= 50
                  ? "Good"
                  : "Needs Improvement"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MarksPage;

/* same styles as yours (unchanged) */
const container = {
  padding: "30px",
  background: "#f4f7fc",
  minHeight: "100vh",
};

const header = {
  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  color: "white",
  padding: "30px",
  borderRadius: "20px",
  marginBottom: "30px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
  gap: "25px",
};

const card = {
  background: "white",
  borderRadius: "20px",
  padding: "25px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
};

const icon = { fontSize: "45px", marginBottom: "15px" };

const courseTitle = { marginBottom: "15px", color: "#1f2937" };

const infoBox = {
  color: "#6b7280",
  marginBottom: "20px",
  lineHeight: "28px",
};

const percentageContainer = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "20px",
};

const percentageCircle = {
  width: "90px",
  height: "90px",
  borderRadius: "50%",
  background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  fontWeight: "bold",
};

const badge = {
  textAlign: "center",
  padding: "10px",
  borderRadius: "30px",
  fontWeight: "600",
};

const loadingBox = {
  background: "white",
  padding: "40px",
  borderRadius: "15px",
  textAlign: "center",
};

const emptyBox = {
  background: "white",
  padding: "50px",
  borderRadius: "15px",
  textAlign: "center",
};