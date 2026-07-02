import { useEffect, useMemo, useState } from "react";
import { getCourses } from "../services/courseApi";
import Sidebar from "../components/Sidebar";
import {
  getStudentsByCourse,
  bulkAttendance,
} from "../services/attendanceApi";

function AddAttendancePage() {
  const [attendanceDate, setAttendanceDate] = useState(
  new Date().toISOString().split("T")[0]
);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCourseChange(e) {
    const courseId = e.target.value;

    setSelectedCourse(courseId);

    if (!courseId) {
      setStudents([]);
      setAttendance({});
      return;
    }

    try {
      setLoading(true);

      const data = await getStudentsByCourse(courseId);

      setStudents(data);

      const obj = {};

      data.forEach((student) => {
        obj[student.id] = "Present";
      });

      setAttendance(obj);
    } catch (err) {
      console.error(err);
      alert("Unable to load students.");
    } finally {
      setLoading(false);
    }
  }

  function changeStatus(studentId, status) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  }

  function markAll(status) {
    const obj = {};

    students.forEach((student) => {
      obj[student.id] = status;
    });

    setAttendance(obj);
  }

  async function saveAttendance() {
    if (!selectedCourse) {
      alert("Please select a course.");
      return;
    }

    if (students.length === 0) {
      alert("No students enrolled.");
      return;
    }

    const records = students.map((student) => ({
      student_id: student.id,
      status: attendance[student.id],
    }));

    try {
      await bulkAttendance({
        course_id: selectedCourse,
       attendance_date: attendanceDate,
        records,
      });

      alert("Attendance Saved Successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance.");
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  return (
    <div className="p-6">

      <div className="bg-white rounded-3xl shadow-xl p-6">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>

            <h1 className="text-3xl font-bold text-gray-800">
              Add Attendance
            </h1>

            <p className="text-gray-500 mt-1">
              Select a course and mark attendance.
            </p>

          </div>

          <div>

  <label className="font-semibold block mb-2">
    Attendance Date
  </label>

  <input
    type="date"
    value={attendanceDate}
    onChange={(e) => setAttendanceDate(e.target.value)}
    className="border rounded-xl p-3 w-full"
  />

</div>

        </div>

        <div className="grid md:grid-cols-2 gap-5 mb-6">

          <div>

            <label className="font-semibold block mb-2">
              Course
            </label>

            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="">
                Select Course
              </option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.title}
                </option>
              ))}
            </select>

          </div>

          <div>

            <label className="font-semibold block mb-2">
              Search Student
            </label>

            <input
              type="text"
              placeholder="Search by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-xl p-3"
            />

          </div>

        </div>

        <div className="flex gap-3 mb-5">

          <button
            onClick={() => markAll("Present")}
            className="bg-green-600 text-white px-5 py-2 rounded-xl"
          >
            Select All Present
          </button>

          <button
            onClick={() => markAll("Absent")}
            className="bg-red-600 text-white px-5 py-2 rounded-xl"
          >
            Select All Absent
          </button>

        </div>

        <div className="overflow-hidden rounded-2xl border">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="text-left p-4">
                  Student
                </th>

                <th className="text-center p-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="2"
                    className="text-center p-8"
                  >
                    Loading...
                  </td>

                </tr>

              ) : filteredStudents.length === 0 ? (

                <tr>

                  <td
                    colSpan="2"
                    className="text-center p-8"
                  >
                    No Students Found
                  </td>

                </tr>

              ) : (

                filteredStudents.map((student) => (

                  <tr
                    key={student.id}
                    className="border-t"
                  >

                    <td className="p-4">

                      <div className="font-semibold">
                        {student.name}
                      </div>

                      <div className="text-gray-500 text-sm">
                        {student.email}
                      </div>

                    </td>

                    <td className="text-center p-4">

                      <select
                        value={attendance[student.id]}
                        onChange={(e) =>
                          changeStatus(
                            student.id,
                            e.target.value
                          )
                        }
                        className="border rounded-lg px-3 py-2"
                      >
                        <option value="Present">
                          Present
                        </option>

                        <option value="Absent">
                          Absent
                        </option>
                      </select>

                    </td>

                  </tr>

                ))
                              )}

            </tbody>

          </table>

        </div>

        <div className="mt-6 flex justify-end">

          <button
            onClick={saveAttendance}
            disabled={
              !selectedCourse ||
              students.length === 0
            }
            className={`px-8 py-3 rounded-xl font-semibold text-white transition

            ${
              !selectedCourse ||
              students.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }

            `}
          >
            Save Attendance
          </button>

        </div>

      </div>

    </div>

  );
}

export default AddAttendancePage;