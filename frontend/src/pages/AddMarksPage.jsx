import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

function AddMarksPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);


  const [form, setForm] = useState({
    student_id: "",
    course_id: "",
    marks_obtained: "",
    total_marks: "",
  
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const studentsRes = await api.get("/students");
      const coursesRes = await api.get("/courses");

      setStudents(studentsRes.data.data || []);
      setCourses(coursesRes.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/marks", form);

      alert("✅ Marks Added Successfully");

      setForm({
        student_id: "",
        course_id: "",
        marks_obtained: "",
        total_marks: "",
        percentage: "",
      });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to Add Marks");
    } finally {
      setLoading(false);
    }
  }

  const percentage =
    form.marks_obtained && form.total_marks
      ? (
          (Number(form.marks_obtained) /
            Number(form.total_marks)) *
          100
        ).toFixed(2)
      : 0;

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
        <h1>📝 Add Student Marks</h1>
        <p>
          Record student examination marks
        </p>
      </div>

      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          background: "white",
          padding: "30px",
          borderRadius: "20px",
          boxShadow:
            "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >
        <form onSubmit={handleSubmit}>
          {/* STUDENT */}
          <div style={{ marginBottom: "15px" }}>
            <label>Student</label>

            <select
              value={form.student_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  student_id: e.target.value,
                })
              }
              style={inputStyle}
              required
            >
              <option value="">
                Select Student
              </option>

              {students.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                >
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* COURSE */}
          <div style={{ marginBottom: "15px" }}>
            <label>Course</label>

            <select
              value={form.course_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  course_id: e.target.value,
                })
              }
              style={inputStyle}
              required
            >
              <option value="">
                Select Course
              </option>

              {courses.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* MARKS */}
          <div style={{ marginBottom: "15px" }}>
            <label>Marks Obtained</label>

            <input
              type="number"
              value={form.marks_obtained}
              onChange={(e) =>
                setForm({
                  ...form,
                  marks_obtained:
                    e.target.value,
                })
              }
              placeholder="Enter Marks"
              style={inputStyle}
              required
            />
          </div>

          {/* TOTAL */}
          <div style={{ marginBottom: "20px" }}>
            <label>Total Marks</label>

            <input
              type="number"
              value={form.total_marks}
              onChange={(e) =>
                setForm({
                  ...form,
                  total_marks:
                    e.target.value,
                })
              }
              placeholder="Enter Total Marks"
              style={inputStyle}
              required
            />
          </div>

          {/* LIVE PERCENTAGE */}
          <div
            style={{
              background: "#f8fafc",
              padding: "15px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <h3>
              Percentage: {percentage}%
            </h3>

            <div
              style={{
                width: "100%",
                height: "10px",
                background: "#e5e7eb",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: "100%",
                  background:
                    percentage >= 50
                      ? "#22c55e"
                      : "#ef4444",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background:
                "linear-gradient(135deg,#f59e0b,#f97316)",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {loading
              ? "Saving..."
              : "Add Marks"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "5px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  fontSize: "14px",
};

export default AddMarksPage;