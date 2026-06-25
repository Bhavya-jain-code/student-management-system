import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

function EnrollStudentPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  // STUDENTS
  const loadStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // COURSES
  const loadCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ENROLL API
  const handleEnroll = async () => {
    try {
      if (!selectedStudent || !selectedCourse) {
        alert("Please select student and course");
        return;
      }

      const payload = {
        student_id: selectedStudent.id,
        course_id: selectedCourse.id,
      };

      await api.post("/EnrollStudent", payload);

      alert("Student Enrolled Successfully");

      setSelectedStudent(null);
      setSelectedCourse(null);
    } catch (err) {
      console.log("Enroll Error:", err);
      alert("Enrollment Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Enroll Student
        </h1>
        <p className="text-gray-500">
          Assign students to courses
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* STUDENTS */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-xl font-semibold mb-4">
            Students
          </h2>

          {students.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              className={`flex justify-between p-3 border rounded-xl cursor-pointer mb-2
                ${selectedStudent?.id === s.id ? "bg-blue-100 border-blue-500" : ""}
              `}
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-gray-500">{s.email}</p>
              </div>

              <span className="text-blue-600 font-semibold">
                Select
              </span>
            </div>
          ))}
        </div>

        {/* COURSES */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-xl font-semibold mb-4">
            Courses
          </h2>

          {courses.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCourse(c)}
              className={`flex justify-between p-3 border rounded-xl cursor-pointer mb-2
                ${selectedCourse?.id === c.id ? "bg-green-100 border-green-500" : ""}
              `}
            >
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-gray-500">
                  ₹{c.fee} • {c.duration}
                </p>
              </div>

              <span className="text-green-600 font-semibold">
                Select
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className="mt-6 bg-white p-5 rounded-2xl shadow flex justify-between items-center">

        <div>
          <p>
            Student:{" "}
            <b>{selectedStudent?.name || "Not selected"}</b>
          </p>

          <p>
            Course:{" "}
            <b>{selectedCourse?.title || "Not selected"}</b>
          </p>
        </div>

        <button
          onClick={handleEnroll}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
        >
          Enroll 
        </button>
      </div>

    </div>
  );
}

export default EnrollStudentPage;