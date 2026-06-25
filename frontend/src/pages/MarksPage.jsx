import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

function MarksPage() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarks();
  }, []);
  
  async function loadMarks() {
    try {
      const res = await api.get("/marks");

      console.log(res.data); 
      // If API returns { success:true,data:[...] }
      setMarks(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

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
  const percentages = marks.map(
  (m) =>
    (Number(m.marks_obtained) /
      Number(m.total_marks)) *
    100
);

const avgPercentage =
  percentages.length > 0
    ? (
        percentages.reduce(
          (a, b) => a + b,
          0
        ) / percentages.length
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

const topper =
  marks.length > 0
    ? marks.reduce((prev, curr) =>
        (Number(curr.marks_obtained) /
          Number(curr.total_marks)) *
          100 >
        (Number(prev.marks_obtained) /
          Number(prev.total_marks)) *
          100
          ? curr
          : prev
      )
    : null;

const passedStudents =
  percentages.filter(
    (p) => p >= 50
  ).length;

const failedStudents =
  percentages.filter(
    (p) => p < 50
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
            "linear-gradient(135deg,#f59e0b,#f97316)",
          color: "white",
          padding: "25px",
          borderRadius: "20px",
          marginBottom: "25px",
        }}
      >
        <h1>📝 Marks Management</h1>
        <p>Manage student examination records</p>
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
    <h3>📚 Total Records</h3>
    <h1>{marks.length}</h1>
  </div>

  <div style={cardStyle}>
    <h3>📊 Average %</h3>
    <h1 style={{ color: "#3b82f6" }}>
      {avgPercentage}%
    </h1>
  </div>

  <div style={cardStyle}>
    <h3>🏆 Highest %</h3>
    <h1 style={{ color: "#22c55e" }}>
      {highestPercentage}%
    </h1>
  </div>

  <div style={cardStyle}>
    <h3>📉 Lowest %</h3>
    <h1 style={{ color: "#ef4444" }}>
      {lowestPercentage}%
    </h1>
  </div>

  <div style={cardStyle}>
    <h3>✅ Passed</h3>
    <h1 style={{ color: "#22c55e" }}>
      {passedStudents}
    </h1>
  </div>

  <div style={cardStyle}>
    <h3>❌ Failed</h3>
    <h1 style={{ color: "#ef4444" }}>
      {failedStudents}
    </h1>
  </div>

  <div style={cardStyle}>
    <h3>👑 Topper</h3>
    <h1
      style={{
        fontSize: "20px",
        color: "#7c3aed",
      }}
    >
      {topper
        ? topper.student_name
        : "-"}
    </h1>
  </div>
</div>

      {/* TABLE */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "20px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>
          Marks Records
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : marks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px",
              color: "#666",
            }}
          >
            No marks records found
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
                  background: "#fff7ed",
                }}
              >
                <th style={thStyle}>Student</th>
                <th style={thStyle}>Course</th>
                <th style={thStyle}>Marks</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Percentage</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>

            <tbody>
              {marks.map((m) => (
                <tr key={m.id}>
                  <td style={tdStyle}>
                    {m.student_name}
                  </td>

                  <td style={tdStyle}>
                    {m.course_name}
                  </td>

                  <td style={tdStyle}>
                    {m.marks_obtained}
                  </td>

                  <td style={tdStyle}>
                    {m.total_marks}
                  </td>

                  <td style={tdStyle}>
  <span
    style={{
      padding: "6px 12px",
      borderRadius: "20px",
      color: "white",
      background:
        ((Number(m.marks_obtained) /
          Number(m.total_marks)) *
          100) >= 50
          ? "#22c55e"
          : "#ef4444",
    }}
  >
    {(
      (Number(m.marks_obtained) /
        Number(m.total_marks)) *
      100
    ).toFixed(2)}
    %
  </span>
</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() =>
                        deleteMarks(
                          m.id
                        )
                      }
                      style={{
                        background:
                          "#ef4444",
                        color:
                          "white",
                        border:
                          "none",
                        padding:
                          "8px 14px",
                        borderRadius:
                          "8px",
                        cursor:
                          "pointer",
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

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "15px",
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.08)",
};

const thStyle = {
  padding: "15px",
  textAlign: "left",
};

const tdStyle = {
  padding: "15px",
  borderBottom: "1px solid #eee",
};

export default MarksPage;