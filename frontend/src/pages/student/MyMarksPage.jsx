import { useEffect, useState, useMemo } from "react";
import { getStudentMarks } from "../../services/studentApi";

function MarksPage() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const load = async () => {
      try {
        const studentId = localStorage.getItem("student_id");

        if (!studentId) {
          setMarks([]);
          setLoading(false);
          return;
        }

        const res = await getStudentMarks(studentId);

        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];

        setMarks(data);
      } catch (e) {
        setMarks([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getDate = (m) => m.created_at || m.createdAt || m.date || "";

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return "";
    return dt.toISOString().split("T")[0];
  };

  // FILTER DATA
  const filtered = useMemo(() => {
    return marks.filter((m) => {
      const courseOk =
        selectedCourse === "all" || m.course_name === selectedCourse;

      const dateOk =
        !selectedDate || formatDate(getDate(m)) === selectedDate;

      return courseOk && dateOk;
    });
  }, [marks, selectedCourse, selectedDate]);

  // RESET PAGE WHEN FILTER CHANGES
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourse, selectedDate]);

  // PAGINATION
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedMarks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const courses = useMemo(() => {
    return ["all", ...new Set(marks.map((m) => m.course_name))];
  }, [marks]);

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <h1>📊 Marks History</h1>
        <p>Track your performance easily</p>

        {/* FILTERS */}
        <div style={filterBox}>
          <div style={chipBox}>
            {courses.map((c, i) => (
              <button
                key={i}
                onClick={() => setSelectedCourse(c)}
                style={{
                  ...chip,
                  background:
                    selectedCourse === c
                      ? "#fff"
                      : "rgba(255,255,255,0.15)",
                  color: selectedCourse === c ? "#4f46e5" : "#fff",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={dateRow}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={dateInput}
            />

            <button onClick={() => setSelectedDate("")} style={clearBtn}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && <div style={box}>Loading...</div>}

      {/* EMPTY */}
      {!loading && filtered.length === 0 && (
        <div style={box}>No marks found</div>
      )}

      {/* DATA */}
      {!loading && (
        <div style={grid}>
          {paginatedMarks.map((m, i) => (
            <div key={i} style={card}>
              <h3>{m.course_name}</h3>

              <p>
                Marks: {m.marks_obtained}/{m.total_marks}
              </p>

              <div style={circle}>
                {Number(m.percentage || 0).toFixed(1)}%
              </div>

              <div
                style={{
                  ...badge,
                  background:
                    m.percentage >= 75
                      ? "#dcfce7"
                      : m.percentage >= 50
                      ? "#fef3c7"
                      : "#fee2e2",
                }}
              >
                {m.percentage >= 75
                  ? "Excellent"
                  : m.percentage >= 50
                  ? "Good"
                  : "Need Improvement"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION (ALWAYS VISIBLE) */}
      <div style={paginationBox}>
        <button
          style={btn}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          ⬅ Prev
        </button>

        <span style={{ fontWeight: "bold" }}>
          Page {currentPage} of {Math.max(1, totalPages)}
        </span>

        <button
          style={btn}
          onClick={() =>
            setCurrentPage((p) => Math.min(p + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}

export default MarksPage;

/* ================= STYLES ================= */

const container = {
  padding: "25px",
  background: "#f4f7fc",
  minHeight: "100vh",
};

const header = {
  background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
  color: "#fff",
  padding: "20px",
  borderRadius: "15px",
};

const filterBox = {
  marginTop: "15px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const chipBox = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const chip = {
  padding: "7px 14px",
  borderRadius: "20px",
  border: "none",
  cursor: "pointer",
  fontSize: "13px",
};

const dateRow = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const dateInput = {
  padding: "8px",
  borderRadius: "10px",
  border: "none",
};

const clearBtn = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "none",
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
  gap: "15px",
  marginTop: "20px",
};

const card = {
  background: "#fff",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
};

const circle = {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "10px auto",
  fontWeight: "bold",
};

const badge = {
  textAlign: "center",
  padding: "6px",
  borderRadius: "20px",
  marginTop: "10px",
};

const box = {
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  textAlign: "center",
  marginTop: "20px",
};

const paginationBox = {
  marginTop: "25px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "15px",
};

const btn = {
  padding: "10px 15px",
  borderRadius: "10px",
  border: "none",
  background: "#4f46e5",
  color: "#fff",
  cursor: "pointer",
};