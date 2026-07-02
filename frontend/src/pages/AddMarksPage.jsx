import { useEffect, useState } from "react";
import api from "../services/axiosInstance";
import { getStudentCourses } from "../services/enrollmentApi";

function AddMarksPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [marks, setMarks] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data.data || res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleStudentChange = async (e) => {
    const studentId = e.target.value;

    setSelectedStudent(studentId);
    setSelectedCourse("");
    setCourses([]);

    if (!studentId) return;

    try {
      const data = await getStudentCourses(studentId);

      const courseList = data.data || data.courses || data || [];

      setCourses(Array.isArray(courseList) ? courseList : []);
    } catch (err) {
      console.log(err);
      setCourses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedStudent ||
      !selectedCourse ||
      !marks ||
      !totalMarks
    ) {
      setMessage("Please fill all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const percentage =
        (Number(marks) / Number(totalMarks)) * 100;

      await api.post("/marks", {
        student_id: Number(selectedStudent),
        course_id: Number(selectedCourse),
        marks_obtained: Number(marks),
        total_marks: Number(totalMarks),
        percentage: percentage.toFixed(2),
      });

      setMessage("✅ Marks added successfully.");

      setSelectedStudent("");
      setSelectedCourse("");
      setCourses([]);
      setMarks("");
      setTotalMarks("");
    } catch (err) {
      console.log(err);

      setMessage(
        err?.response?.data?.message ||
          "Error adding marks."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-xl">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Add Student Marks
        </h2>

        {message && (
          <div
            className={`mb-4 text-center font-medium ${
              message.includes("success")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* Student */}

          <select
            className="w-full border p-3 rounded-lg"
            value={selectedStudent}
            onChange={handleStudentChange}
          >
            <option value="">
              Select Student
            </option>

            {students.map((stu) => (
              <option
                key={stu.id || stu._id}
                value={stu.id || stu._id}
              >
                {stu.name}
              </option>
            ))}
          </select>

          {/* Course */}

          <select
            className="w-full border p-3 rounded-lg"
            value={selectedCourse}
            onChange={(e) =>
              setSelectedCourse(e.target.value)
            }
            disabled={!selectedStudent}
          >
            <option value="">
              {selectedStudent
                ? "Select Course"
                : "Select Student First"}
            </option>

            {courses.length > 0 ? (
              courses.map((course) => (
                <option
                  key={
                    course.id ||
                    course.course_id ||
                    course._id
                  }
                  value={
                    course.id ||
                    course.course_id ||
                    course._id
                  }
                >
                  {course.title ||
                    course.course_name ||
                    course.name}
                </option>
              ))
            ) : (
              selectedStudent && (
                <option disabled>
                  No enrolled courses found
                </option>
              )
            )}
          </select>

          {/* Marks */}

          <input
            type="number"
            className="w-full border p-3 rounded-lg"
            placeholder="Marks Obtained"
            value={marks}
            onChange={(e) =>
              setMarks(e.target.value)
            }
          />

          {/* Total Marks */}

          <input
            type="number"
            className="w-full border p-3 rounded-lg"
            placeholder="Total Marks"
            value={totalMarks}
            onChange={(e) =>
              setTotalMarks(e.target.value)
            }
          />

          {marks &&
            totalMarks &&
            Number(totalMarks) > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 font-semibold">
                Percentage :{" "}
                {(
                  (Number(marks) /
                    Number(totalMarks)) *
                  100
                ).toFixed(2)}
                %
              </div>
            )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg text-white font-semibold ${
              loading
                ? "bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Submitting..."
              : "Add Marks"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AddMarksPage;