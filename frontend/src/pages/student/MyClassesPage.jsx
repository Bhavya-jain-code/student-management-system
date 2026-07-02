import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseClasses } from "../../services/classApi";
import { getStudentEnrollments } from "../../services/enrollmentApi";


export default function MyClassesPage() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const studentId = localStorage.getItem("student_id");
const { id } = useParams();
  useEffect(() => {
    loadClassesData();
  }, []);

  function getVideoSrc(videoUrl) {
    if (!videoUrl) return null;

    const iframeMatch = videoUrl.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) {
      return iframeMatch[1];
    }

    const watchIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
    if (watchIdMatch) {
      return `https://www.youtube.com/embed/${watchIdMatch[1]}`;
    }

    return videoUrl;
  }

  async function loadClassesData() {
    try {
      setLoading(true);
      setError(null);

      if (!studentId) {
        console.error("Student ID is null:", studentId);
        setError("Student ID not found. Please login again.");
        return;
      }

      console.log("Loading classes for studentId:", studentId);

     const enrollmentsRes = await getStudentEnrollments(studentId);

if (!enrollmentsRes?.data) {
  setCourses([]);
  setClasses([]);
  return;
}

const selectedCourse = enrollmentsRes.data.find(
  (c) => String(c.course_id) === String(id)
);

if (!selectedCourse) {
  setCourses([]);
  setClasses([]);
  return;
}

setCourses([selectedCourse]);

const classesRes = await getCourseClasses(id);

setClasses(
  (classesRes.data || []).map((cls) => ({
    ...cls,
    course_name: selectedCourse.course_name,
    course_id: selectedCourse.course_id,
  }))
);
    } catch (err) {
      console.error("Error loading classes:", err);
      setError("Failed to load classes. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ margin: 0 }}>🎓 My Classes</h1>
        <p style={{ marginTop: "10px", opacity: 0.9 }}>
          {courses.length > 0
            ? `${courses.length} course${courses.length !== 1 ? "s" : ""} enrolled`
            : "Watch your course lectures and materials"}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={errorStyle}>
          <h3>⚠️ {error}</h3>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={loadingStyle}>
          <h3>Loading Classes...</h3>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && classes.length === 0 && (
        <div style={emptyStyle}>
          <h2>📭 No Classes Found</h2>
          <p>
            {courses.length === 0
              ? "You haven't enrolled in any courses yet."
              : "No classes available for your enrolled courses."}
          </p>
        </div>
      )}

      {/* Cards */}
      {!loading && !error && classes.length > 0 && (
        <div style={gridStyle}>
          {classes.map((cls) => (
            <div key={cls.id} style={cardStyle}>
              <div style={courseTagStyle}>{cls.course_name}</div>

              <h3 style={titleStyle}>{cls.title}</h3>

              <p style={textStyle}>{cls.description}</p>

                      {cls.video_url && (
                <div style={{ marginTop: "10px" }}>
                  <iframe
                    width="100%"
                    height="200"
                    src={getVideoSrc(cls.video_url)}
                    title="class video"
                    style={{ borderRadius: "12px" }}
                    allowFullScreen
                  />
                </div>
              )}

              <div style={badgeStyle}>Class Available</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =======================
   STYLES (Sidebar Compatible UI)
======================= */

const containerStyle = {
  padding: "30px",
  background: "#f4f7fc",
  minHeight: "100vh",
};

const headerStyle = {
  background: "linear-gradient(135deg, #6366f1, #4338ca)",
  color: "white",
  padding: "30px",
  borderRadius: "15px",
  marginBottom: "30px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
};

const errorStyle = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "20px",
  borderRadius: "12px",
  marginBottom: "20px",
  border: "1px solid #fecaca",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px",
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
  position: "relative",
};

const courseTagStyle = {
  display: "inline-block",
  background: "#e0e7ff",
  color: "#3730a3",
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "11px",
  fontWeight: "700",
  marginBottom: "8px",
  textTransform: "uppercase",
};

const titleStyle = {
  margin: "0 0 10px",
  color: "#111827",
};

const textStyle = {
  color: "#6b7280",
};

const badgeStyle = {
  display: "inline-block",
  marginTop: "12px",
  background: "#dbeafe",
  color: "#1d4ed8",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "13px",
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