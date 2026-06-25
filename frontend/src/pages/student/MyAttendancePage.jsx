
import { useEffect, useState } from "react";
import { getStudentAttendance } from "../../services/studentApi";

export default function MyAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      const studentId = localStorage.getItem("student_id");

      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        const res = await getStudentAttendance(studentId);
        setAttendance(res.data || []);
      } catch (err) {
        console.log("Attendance Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  return (
    <div style={container}>
      <div style={header}>
        <h1>📊 Attendance Report</h1>
        <p>Track your attendance across all enrolled courses.</p>
      </div>

      {loading ? (
        <div style={loadingBox}>
          <h3>Loading Attendance...</h3>
        </div>
      ) : attendance.length === 0 ? (
        <div style={emptyBox}>
          <h2>📭 No Attendance Records</h2>
          <p>No attendance data available.</p>
        </div>
      ) : (
        <>
          <div style={summaryGrid}>
            <div style={summaryCard}>
              <h3>Total Courses</h3>
              <h1>{attendance.length}</h1>
            </div>

            <div style={summaryCard}>
              <h3>Average Attendance</h3>
              <h1>
                {Math.round(
                  attendance.reduce(
                    (sum, item) =>
                      sum +
                      Number(item.attendance_percent),
                    0
                  ) / attendance.length
                )}
                %
              </h1>
            </div>
          </div>

          <div style={cardsGrid}>
            {attendance.map((item, index) => (
              <div
                key={item.id || index}
                style={attendanceCard}
              >
                <h2>{item.course_name}</h2>

                <div style={circleBox}>
                  <div style={circle}>
                    {item.attendance_percent}%
                  </div>
                </div>

                <div style={progressContainer}>
                  <div
                    style={{
                      ...progressBar,
                      width: `${item.attendance_percent}%`,
                      background:
                        item.attendance_percent >= 75
                          ? "#22c55e"
                          : "#ef4444",
                    }}
                  />
                </div>

                <div
                  style={{
                    ...badge,
                    background:
                      item.attendance_percent >= 75
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      item.attendance_percent >= 75
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  {item.attendance_percent >= 75
                    ? "Excellent Attendance"
                    : "Low Attendance"}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const container = {
  padding: "30px",
  background: "#f4f7fc",
  minHeight: "100vh",
};

const header = {
  background:
    "linear-gradient(135deg,#06b6d4,#3b82f6)",
  color: "white",
  padding: "30px",
  borderRadius: "20px",
  marginBottom: "25px",
};

const loadingBox = {
  background: "white",
  padding: "40px",
  textAlign: "center",
  borderRadius: "15px",
};

const emptyBox = {
  background: "white",
  padding: "50px",
  textAlign: "center",
  borderRadius: "15px",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(250px,1fr))",
  gap: "20px",
  marginBottom: "25px",
};

const summaryCard = {
  background: "white",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const cardsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(320px,1fr))",
  gap: "25px",
};

const attendanceCard = {
  background: "white",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
};

const circleBox = {
  display: "flex",
  justifyContent: "center",
  margin: "20px 0",
};

const circle = {
  width: "90px",
  height: "90px",
  borderRadius: "50%",
  background:
    "linear-gradient(135deg,#06b6d4,#3b82f6)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "22px",
};

const progressContainer = {
  width: "100%",
  height: "12px",
  background: "#e5e7eb",
  borderRadius: "20px",
  overflow: "hidden",
  marginBottom: "15px",
};

const progressBar = {
  height: "100%",
};

const badge = {
  textAlign: "center",
  padding: "10px",
  borderRadius: "20px",
  fontWeight: "600",
};

