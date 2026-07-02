import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCourses,
  deleteCourse,
  updateCourseStatus,
} from "../services/courseApi";

import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";

function CourseListPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await getCourses();
      setCourses(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  // Toggle Status
  async function toggleStatus(course) {
    const newStatus =
      course.status?.toLowerCase() === "active"
        ? "inactive"
        : "active";

    await updateCourseStatus(course.id, newStatus);
    loadCourses();
  }

  // Delete
  async function handleDelete(id) {
    const ok = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!ok) return;

    await deleteCourse(id);
    loadCourses();
  }

  // Filter
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        c.duration
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        c.fee?.toString().includes(search);

      const matchStatus = showInactive
        ? true
        : c.status?.toLowerCase() === "active";

      return matchSearch && matchStatus;
    });
  }, [courses, search, showInactive]);

  // Pagination
  const totalPages = Math.ceil(
    filteredCourses.length / recordsPerPage
  );

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentCourses = filteredCourses.slice(
    indexOfFirst,
    indexOfLast
  );

  // Reset page
  useEffect(() => {
    setCurrentPage(1);
  }, [search, showInactive]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Courses
          </h1>
        </div>

        <button
          onClick={() =>
            navigate("/pages/addCourse")
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
        >
          + Add Course
        </button>

      </div>

      {/* Search */}

      <div className="flex flex-col md:flex-row gap-4 mb-6">

        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-xl px-4 py-3 flex-1"
        />

        <button
          onClick={() =>
            setShowInactive(!showInactive)
          }
          className={`px-5 py-3 rounded-xl text-white ${
            showInactive
              ? "bg-gray-600"
              : "bg-green-600"
          }`}
        >
          {showInactive
            ? "Hide Inactive"
            : "Show All"}
        </button>

      </div>

      {/* Showing */}

      <div className="flex justify-between items-center mb-4">

        <p className="text-gray-600">
          Showing{" "}
          <b>
            {filteredCourses.length === 0
              ? 0
              : indexOfFirst + 1}
          </b>{" "}
          -
          <b>
            {" "}
            {Math.min(
              indexOfLast,
              filteredCourses.length
            )}
          </b>{" "}
          of <b>{filteredCourses.length}</b> courses
        </p>

        <p className="text-gray-600">
          Page <b>{currentPage}</b> /{" "}
          <b>{Math.max(totalPages, 1)}</b>
        </p>

      </div>

      {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-200">
            <tr>
              <th className="p-4">ID</th>
              <th>Title</th>
              <th>Duration</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {currentCourses.length > 0 ? (
              currentCourses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b text-center hover:bg-gray-50"
                >
                  <td className="p-4 font-semibold">
                    #{course.id}
                  </td>

                  <td>{course.title}</td>

                  <td>{course.duration}</td>

                  <td>₹{course.fee}</td>

                  <td>
                    <button
                      onClick={() => toggleStatus(course)}
                      className={`px-3 py-1 rounded-full text-sm text-white ${
                        course.status === "active"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {course.status}
                    </button>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-4">

                      <button
                        onClick={() => toggleStatus(course)}
                        title="Toggle Status"
                      >
                        {course.status === "active" ? (
                          <FaToggleOn className="text-green-600 text-2xl" />
                        ) : (
                          <FaToggleOff className="text-red-500 text-2xl" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(course.id)}
                        title="Delete Course"
                      >
                        <FaTrash className="text-red-600 text-lg hover:text-red-800" />
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/admin/courses/edit/${course.id}`)
                        }
                        title="Edit Course"
                      >
                        <FaEdit className="text-blue-600 text-lg hover:text-blue-800" />
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

      {/* Pagination */}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">

          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className={`px-5 py-2 rounded-lg font-semibold ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            ← Previous
          </button>

          <div className="flex gap-2 flex-wrap justify-center">

            {Array.from(
              { length: totalPages },
              (_, index) => {
                const page = index + 1;

                return (
                  <button
                    key={page}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={`w-10 h-10 rounded-lg font-semibold ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-white border hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              }
            )}

          </div>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className={`px-5 py-2 rounded-lg font-semibold ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next →
          </button>

        </div>
      )}

    </div>
  );
}

export default CourseListPage;