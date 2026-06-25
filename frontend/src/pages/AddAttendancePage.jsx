import { useState } from "react";
import { addAttendance } from "../services/attendanceApi";

function AddAttendancePage() {
  const [formData, setFormData] = useState({
    student_id: "",
    course_id: "",
    attendance_date: "",
    status: "Present",
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await addAttendance(formData);

      alert("Attendance Added");

      setFormData({
        student_id: "",
        course_id: "",
        attendance_date: "",
        status: "Present",
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-5">
        Add Attendance
      </h1>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="student_id"
          placeholder="Student ID"
          value={formData.student_id}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />

        <input
          type="number"
          name="course_id"
          placeholder="Course ID"
          value={formData.course_id}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />

        <input
          type="date"
          name="attendance_date"
          value={formData.attendance_date}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border p-3 rounded mb-4"
        >
          <option>Present</option>
          <option>Absent</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          Save Attendance
        </button>
      </form>
    </div>
  );
}

export default AddAttendancePage;