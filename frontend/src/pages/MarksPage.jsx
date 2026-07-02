import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

function MarksPage() {
  const [marks, setMarks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    loadMarks();
  }, []);

  // ================= SAFE % FUNCTION =================

  const getPercentage = (m) => {
    const marksObtained = Number(m?.marks_obtained);
    const totalMarks = Number(m?.total_marks);

    if (!totalMarks || isNaN(marksObtained) || isNaN(totalMarks)) {
      return 0;
    }

    return (marksObtained / totalMarks) * 100;
  };

  // ================= LOAD =================

  async function loadMarks() {
    try {
      const res = await api.get("/marks");
      setMarks(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ================= DELETE =================

  async function deleteMarks(id) {
    const confirmDelete = window.confirm(
      "Delete this marks record?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/marks/${id}`);
      loadMarks();
    } catch (err) {
      console.error(err);
    }
  }

  // ================= SEARCH =================

  const filteredMarks = marks.filter((m) => {
    const text = search.toLowerCase();

    return (
      m.student_name?.toLowerCase().includes(text) ||
      m.course_name?.toLowerCase().includes(text) ||
      m.marks_obtained?.toString().includes(search) ||
      getPercentage(m).toFixed(0).includes(search)
    );
  });

  // ================= PAGINATION =================

  const totalPages = Math.ceil(
    filteredMarks.length / recordsPerPage
  );

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentMarks = filteredMarks.slice(
    indexOfFirst,
    indexOfLast
  );

  // ================= STATS =================

  const percentages = marks.map(getPercentage);

  const avgPercentage =
    percentages.length > 0
      ? (
          percentages.reduce((a, b) => a + b, 0) /
          percentages.length
        ).toFixed(1)
      : 0;

  const highestPercentage =
    percentages.length > 0
      ? Math.max(...percentages).toFixed(1)
      : 0;

  const lowestPercentage =
    percentages.length > 0
      ? Math.min(...percentages).toFixed(1)
      : 0;

  const passedStudents = percentages.filter(
    (p) => p >= 50
  ).length;

  const failedStudents = percentages.filter(
    (p) => p < 50
  ).length;

  const topper =
    marks.length > 0
      ? marks.reduce((prev, curr) =>
          getPercentage(curr) > getPercentage(prev)
            ? curr
            : prev
        )
      : null;

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
        <h1>📝 Marks Management</h1>
        <p>Manage student examination records</p>
      </div>

      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search student, course, marks..."
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
          marginBottom: "20px",
        }}
      />

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
        <Stat title="📚 Total Records" value={marks.length} />
        <Stat
          title="📊 Avg %"
          value={`${avgPercentage}%`}
          color="#3b82f6"
        />
        <Stat
          title="🏆 Highest %"
          value={`${highestPercentage}%`}
          color="#22c55e"
        />
        <Stat
          title="📉 Lowest %"
          value={`${lowestPercentage}%`}
          color="#ef4444"
        />
        <Stat
          title="✅ Passed"
          value={passedStudents}
          color="#22c55e"
        />
        <Stat
          title="❌ Failed"
          value={failedStudents}
          color="#ef4444"
        />
        <Stat
          title="👑 Topper"
          value={topper ? topper.student_name : "-"}
          color="#7c3aed"
        />
      </div>

      {/* TABLE */}
            <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "20px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>Marks Records</h2>

        {loading ? (
          <p>Loading...</p>
        ) : currentMarks.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px" }}>
            No records found
          </p>
        ) : (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#fff7ed" }}>
                  <th style={th}>Student</th>
                  <th style={th}>Course</th>
                  <th style={th}>Marks</th>
                  <th style={th}>Total</th>
                  <th style={th}>Percentage</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {currentMarks.map((m) => {
                  const percent = getPercentage(m);

                  return (
                    <tr key={m.id}>
                      <td style={td}>{m.student_name}</td>
                      <td style={td}>{m.course_name}</td>
                      <td style={td}>{m.marks_obtained}</td>
                      <td style={td}>{m.total_marks}</td>

                      <td style={td}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            color: "#fff",
                            background:
                              percent >= 50
                                ? "#22c55e"
                                : "#ef4444",
                          }}
                        >
                          {percent.toFixed(2)}%
                        </span>
                      </td>

                      <td style={td}>
                        <button
                          onClick={() => deleteMarks(m.id)}
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
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}

            {totalPages > 1 && (
              <div
                style={{
                  marginTop: "25px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
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
                            border: "1px solid #ddd",
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
                  disabled={currentPage === totalPages}
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

// ================= SMALL COMPONENT =================

function Stat({ title, value, color }) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      }}
    >
      <h3>{title}</h3>
      <h1 style={{ color: color || "#111" }}>{value}</h1>
    </div>
  );
}

// ================= STYLES =================

const th = {
  padding: "15px",
  textAlign: "left",
};

const td = {
  padding: "15px",
  borderBottom: "1px solid #eee",
};

export default MarksPage;