import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCourses,
  deleteCourse,
} from "../services/courseApi";

function CourseListPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadCourses();
  }, []);
const navigate = useNavigate();
  async function loadCourses() {
    const data = await getCourses();
    setCourses(data);
  }

  async function handleDelete(id) {
    await deleteCourse(id);
    loadCourses();
  }

  return (

  <div className="p-6 bg-gray-100 min-h-screen">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Course Management
        </h1>
        <p className="text-gray-500">
          Manage all available courses
        </p>
      </div>
      
      <button  
      onClick={() => navigate("/pages/addCourse")}
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium shadow-lg"
>
  + Add Course
  </button>


  
</div>

{/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
  <div className="bg-white p-5 rounded-2xl shadow">
    <p className="text-gray-500">Total Courses</p>
    <h2 className="text-3xl font-bold text-blue-600">
      {courses.length}
    </h2>
  </div>

  <div className="bg-white p-5 rounded-2xl shadow">
    <p className="text-gray-500">Active Courses</p>
    <h2 className="text-3xl font-bold text-green-600">
      {
        courses.filter(
          (course) => course.status === "Active"
        ).length
      }
    </h2>
  </div>

  <div className="bg-white p-5 rounded-2xl shadow">
    <p className="text-gray-500">Inactive Courses</p>
    <h2 className="text-3xl font-bold text-red-600">
      {
        courses.filter(
          (course) => course.status !== "Active"
        ).length
      }
    </h2>
  </div>
</div>

{/* Course Table */}
<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
  <div className="p-5 border-b">
    <h2 className="text-xl font-semibold">
      Course List
    </h2>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-100 text-gray-700">
          <th className="p-4 text-left">ID</th>
          <th className="p-4 text-left">Course</th>
          <th className="p-4 text-left">Duration</th>
          <th className="p-4 text-left">Fee</th>
          <th className="p-4 text-left">Status</th>
          <th className="p-4 text-center">Actions</th>
        </tr>
      </thead>

      <tbody>
        {courses.length > 0 ? (
          courses.map((course) => (
            <tr
              key={course.id}
              className="border-b hover:bg-blue-50 transition"
            >
              <td className="p-4">
                #{course.id}
              </td>

              <td className="p-4 font-medium">
                {course.title}
              </td>

              <td className="p-4">
                {course.duration}
              </td>

              <td className="p-4 font-semibold text-green-600">
                ₹{course.fee}
              </td>

              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm text-white ${
                    course.status === "Active"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {course.status}
                </span>
              </td>

              <td className="p-4">
                <div className="flex justify-center gap-2">
                  {/* <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                    Edit
                  </button> */}

                  <button
                    onClick={() =>
                      handleDelete(course.id)
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={6}
              className="text-center p-10 text-gray-500"
            >
              No Courses Found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
```

  </div>
)};


export default CourseListPage;