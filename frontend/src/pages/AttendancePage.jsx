import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    loadAttendance();
  }, []);

  async function loadAttendance() {
    try {
      const res = await api.get("/attendance");
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAttendance(id) {
    if (!window.confirm("Delete this attendance record?")) return;

    try {
      await api.delete(`/attendance/${id}`);
      loadAttendance();
    } catch (err) {
      console.error(err);
    }
  }

  // ================= SEARCH =================

  const filteredRecords = records.filter((r) => {
    const text = search.toLowerCase();

    return (
      r.student_name?.toLowerCase().includes(text) ||
      r.course_name?.toLowerCase().includes(text) ||
      r.status?.toLowerCase().includes(text) ||
      r.attendance_date?.split("T")[0].includes(search)
    );
  });

  // ================= PAGINATION =================

  const totalPages = Math.ceil(
    filteredRecords.length / recordsPerPage
  );

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentRecords = filteredRecords.slice(
    indexOfFirst,
    indexOfLast
  );

  // ================= STATS =================

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
          background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
          color: "white",
          padding: "25px",
          borderRadius: "20px",
          marginBottom: "25px",
        }}
      >
        <h1>📊 Attendance Management</h1>
        <p>Manage all student attendance records</p>
      </div>

      {/* SEARCH */}

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by student, course, status or date"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
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
        <div style={cardStyle}>
          <h3>Total Records</h3>
          <h1>{records.length}</h1>
        </div>

        <div style={cardStyle}>
          <h3>Present</h3>
          <h1 style={{ color: "#22c55e" }}>
            {presentCount}
          </h1>
        </div>

        <div style={cardStyle}>
          <h3>Absent</h3>
          <h1 style={{ color: "#ef4444" }}>
            {absentCount}
          </h1>
        </div>
      </div>

      {/* TABLE */}
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
        ) : currentRecords.length === 0 ? (
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
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#eef2ff" }}>
                  <th style={thStyle}>Student</th>
                  <th style={thStyle}>Course</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {currentRecords.map((a) => (
                  <tr key={a.id}>
                    <td style={tdStyle}>{a.student_name}</td>

                    <td style={tdStyle}>{a.course_name}</td>

                    <td style={tdStyle}>
                      {a.attendance_date
                        ? new Date(
                            a.attendance_date
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          color: "#fff",
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
                          color: "#fff",
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

            {/* Pagination */}

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginTop: "25px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() =>
                    setCurrentPage((p) => p - 1)
                  }
                  disabled={currentPage === 1}
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background:
                      currentPage === 1
                        ? "#d1d5db"
                        : "#2563eb",
                    color: "#fff",
                    cursor:
                      currentPage === 1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  ← Previous
                </button>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {Array.from(
                    { length: totalPages },
                    (_, index) => {
                      const page = index + 1;

                      return (
                        <button
                          key={page}
                          onClick={() =>
                            setCurrentPage(page)
                          }
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            border:
                              "1px solid #ddd",
                            background:
                              currentPage === page
                                ? "#2563eb"
                                : "#fff",
                            color:
                              currentPage === page
                                ? "#fff"
                                : "#111",
                            cursor: "pointer",
                          }}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((p) => p + 1)
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    background:
                      currentPage === totalPages
                        ? "#d1d5db"
                        : "#2563eb",
                    color: "#fff",
                    cursor:
                      currentPage === totalPages
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Styles

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
};

const thStyle = {
  padding: "15px",
  textAlign: "left",
};

const tdStyle = {
  padding: "15px",
  borderBottom: "1px solid #eee",
};

export default AttendancePage;