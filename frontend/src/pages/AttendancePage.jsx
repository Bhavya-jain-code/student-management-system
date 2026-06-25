import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  async function loadAttendance() {
    try {
      const res = await api.get("/attendance");
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAttendance(id) {
    if (!window.confirm("Delete this attendance record?")) {
      return;
    }

    try {
      await api.delete(`/attendance/${id}`);
      loadAttendance();
    } catch (err) {
      console.error(err);
    }
  }

  const presentCount = records.filter(
    (r) => r.status?.toLowerCase() === "present"
  ).length;

  const absentCount = records.filter(
    (r) => r.status?.toLowerCase() === "absent"
  ).length;

  return (
    <div
      style={{
        padding: "30px",
        background: "#f4f7fc",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#4f46e5,#7c3aed)",
          color: "white",
          padding: "25px",
          borderRadius: "20px",
          marginBottom: "25px",
        }}
      >
        <h1>📊 Attendance Management</h1>
        <p>Manage all student attendance records</p>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Total Records</h3>
          <h1>{records.length}</h1>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Present</h3>
          <h1>{presentCount}</h1>
        </div>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Absent</h3>
          <h1>{absentCount}</h1>
        </div>
      </div>

      {/* TABLE CARD */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          Attendance Records
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : records.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#666",
            }}
          >
            No attendance records found
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#eef2ff",
                }}
              >
                <th style={thStyle}>Student</th>
                <th style={thStyle}>Course</th>
                 <th style={thStyle}>Date</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {records.map((a) => (
                
                <tr key={a.id}>
                  <td style={tdStyle}>
                    {a.student_name}
                  </td>

                  <td style={tdStyle}>
                    {a.course_name}
                  </td>

                  <td style={tdStyle}>
  {a.attendance_date
    ? new Date(a.attendance_date).toLocaleDateString("en-IN")
    : "-"}
</td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        color: "white",
                        background:
                          a.status?.toLowerCase() ===
                          "present"
                            ? "#22c55e"
                            : "#ef4444",
                      }}
                    >
                      {a.status}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <button
                      onClick={() =>
                        deleteAttendance(a.id)
                      }
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "15px",
  textAlign: "left",
};

const tdStyle = {
  padding: "15px",
  borderBottom: "1px solid #eee",
};

export default AttendancePage;