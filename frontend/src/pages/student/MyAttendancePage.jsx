import { useEffect, useState, useMemo } from "react";
import { getStudentAttendance } from "../../services/studentApi";
import api from "../../services/axiosInstance";

export default function MyAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [minPercent, setMinPercent] = useState(0);
  const [sort, setSort] = useState("desc");
  const [monthFilter, setMonthFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadAttendance = async () => {
      const studentId = localStorage.getItem("student_id");

      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        const res = await getStudentAttendance(studentId);
        const rows = Array.isArray(res?.data) ? res.data : [];

        if (rows.length > 0) {
          setAttendance(rows);
          return;
        }

        const fallbackRes = await api.get(`/attendance/${studentId}`);
        const fallbackRows = Array.isArray(fallbackRes?.data) ? fallbackRes.data : [];

        const summary = fallbackRows.reduce((acc, item) => {
          const courseName = item.course_name || item.courseTitle || "Unknown Course";
          const existing = acc.find((entry) => entry.course_name === courseName);

          const presentCount =
            Number(item.status) === 1 ||
            String(item.status).toLowerCase() === "present"
              ? 1
              : 0;

          const totalCount = 1;

          if (existing) {
            existing.present_count += presentCount;
            existing.total_days += totalCount;
            existing.attendance_percent = Math.round(
              (existing.present_count / existing.total_days) * 100
            );
            existing.attendance_date =
              item.attendance_date || existing.attendance_date;
            return acc;
          }

          acc.push({
            course_name: courseName,
            attendance_percent: presentCount ? 100 : 0,
            attendance_date: item.attendance_date || null,
            present_count: presentCount,
            total_days: totalCount,
          });

          return acc;
        }, []);

        setAttendance(summary);
      } catch (err) {
        console.log("Attendance Error:", err);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // FILTER + SORT
  const filteredAttendance = useMemo(() => {
    let data = [...attendance];

    if (search.trim()) {
      data = data.filter((item) =>
        item.course_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (monthFilter) {
      data = data.filter((item) => {
        const itemDate = item.attendance_date
          ? new Date(item.attendance_date)
          : null;
        if (!itemDate || isNaN(itemDate.getTime())) return false;

        const itemMonth = `${itemDate.getFullYear()}-${String(
          itemDate.getMonth() + 1
        ).padStart(2, "0")}`;

        return itemMonth === monthFilter;
      });
    }

    if (dateFilter) {
      data = data.filter((item) => {
        const itemDate = item.attendance_date
          ? new Date(item.attendance_date)
          : null;
        if (!itemDate || isNaN(itemDate.getTime())) return false;

        const itemDay = itemDate.toISOString().split("T")[0];
        return itemDay === dateFilter;
      });
    }

    data = data.filter(
      (item) => Number(item.attendance_percent || 0) >= minPercent
    );

    data.sort((a, b) => {
      return sort === "asc"
        ? Number(a.attendance_percent) - Number(b.attendance_percent)
        : Number(b.attendance_percent) - Number(a.attendance_percent);
    });

    return data;
  }, [attendance, search, minPercent, sort, monthFilter, dateFilter]);

  // RESET PAGE WHEN FILTER CHANGES
  useEffect(() => {
    setCurrentPage(1);
  }, [search, minPercent, sort, monthFilter, dateFilter]);

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAttendance.slice(start, start + itemsPerPage);
  }, [filteredAttendance, currentPage]);

  return (
    <div style={container}>
      <div style={header}>
        <h1>📊 Attendance Report</h1>
        <p>Track your attendance across all enrolled courses.</p>
      </div>

      {/* FILTERS */}
      {!loading && attendance.length > 0 && (
        <div style={filterBox}>
          <input
            style={input}
            placeholder="🔍 Search course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            style={input}
            value={minPercent}
            onChange={(e) => setMinPercent(Number(e.target.value))}
          >
            <option value={0}>All Attendance</option>
            <option value={50}>50%+</option>
            <option value={60}>60%+</option>
            <option value={75}>75%+</option>
          </select>

          <input
            type="month"
            style={input}
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />

          <input
            type="date"
            style={input}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <select
            style={input}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="desc">High → Low</option>
            <option value="asc">Low → High</option>
          </select>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div style={loadingBox}>
          <h3>Loading Attendance...</h3>
        </div>
      ) : paginatedData.length === 0 ? (
        <div style={emptyBox}>
          <h2>📭 No Records Found</h2>
        </div>
      ) : (
        <>
          {/* SUMMARY */}
          <div style={summaryGrid}>
            <div style={summaryCard}>
              <h3>Total Courses</h3>
              <h1>{filteredAttendance.length}</h1>
            </div>

            <div style={summaryCard}>
              <h3>Average Attendance</h3>
              <h1>
                {Math.round(
                  filteredAttendance.reduce(
                    (sum, item) => sum + Number(item.attendance_percent || 0),
                    0
                  ) / filteredAttendance.length
                )}
                %
              </h1>
            </div>
          </div>

          {/* CARDS */}
          <div style={cardsGrid}>
            {paginatedData.map((item, index) => (
              <div key={index} style={attendanceCard}>
                <h2>{item.course_name}</h2>

                <p style={dateText}>
                  📅 {formatDate(item.attendance_date)}
                </p>

                <div style={circleBox}>
                  <div style={circle}>{item.attendance_percent}%</div>
                </div>

                <div style={progressContainer}>
                  <div
                    style={{
                      ...progressBar,
                      width: `${item.attendance_percent}%`,
                      background:
                        item.attendance_percent >= 75 ? "#22c55e" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          <div style={paginationBox}>
            <button
              style={btn}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              ⬅ Prev
            </button>

            <span style={{ fontWeight: "bold" }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              style={btn}
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next ➡
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* STYLES */
const container = { padding: "30px", background: "#f4f7fc", minHeight: "100vh" };
const header = { background: "linear-gradient(135deg,#06b6d4,#3b82f6)", color: "white", padding: "30px", borderRadius: "20px", marginBottom: "25px" };
const filterBox = { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" };
const input = { padding: "10px", borderRadius: "10px", border: "1px solid #ddd", minWidth: "180px" };
const loadingBox = { background: "white", padding: "40px", textAlign: "center", borderRadius: "15px" };
const emptyBox = { background: "white", padding: "50px", textAlign: "center", borderRadius: "15px" };
const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "20px", marginBottom: "25px" };
const summaryCard = { background: "white", padding: "20px", borderRadius: "15px", textAlign: "center" };
const cardsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "25px" };
const attendanceCard = { background: "white", padding: "25px", borderRadius: "20px" };
const dateText = { color: "#6b7280", fontSize: "14px", marginBottom: "10px" };
const circleBox = { display: "flex", justifyContent: "center", margin: "20px 0" };
const circle = { width: "90px", height: "90px", borderRadius: "50%", background: "linear-gradient(135deg,#06b6d4,#3b82f6)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "22px" };
const progressContainer = { width: "100%", height: "12px", background: "#e5e7eb", borderRadius: "20px", overflow: "hidden", marginBottom: "15px" };
const progressBar = { height: "100%" };

const paginationBox = {
  marginTop: "20px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
};

const btn = {
  padding: "10px 15px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  background: "#3b82f6",
  color: "white",
};
