import { useState, useEffect, useMemo } from "react";
import {
  getEnrollments,
  deleteEnrollment,
} from "../services/enrollmentApi";

function EnrollmentPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const [deletedItem, setDeletedItem] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  const recordsPerPage = 10;

  useEffect(() => {
    loadEnrollments();
  }, []);

  async function loadEnrollments() {
    try {
      const data = await getEnrollments();
      setEnrollments(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  // ✅ DELETE WITH UNDO
  async function handleDelete(id) {
    const item = enrollments.find(
      (e) => (e.id || e.enrollment_id) === id
    );

    if (!item) return;

    const ok = window.confirm(
      "Delete this enrollment? You can undo within 5 seconds"
    );
    if (!ok) return;

    // remove instantly
    setEnrollments((prev) =>
      prev.filter((e) => (e.id || e.enrollment_id) !== id)
    );

    setDeletedItem(item);

    // auto delete after 5 sec
    const timer = setTimeout(async () => {
      try {
        await deleteEnrollment(id);
        setDeletedItem(null);
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    setUndoTimer(timer);
  }

  // ✅ UNDO
  function handleUndo() {
    if (!deletedItem) return;

    setEnrollments((prev) => [deletedItem, ...prev]);
    setDeletedItem(null);

    clearTimeout(undoTimer);
  }

  // FILTER + SORT
  const filteredEnrollments = useMemo(() => {
    return [...enrollments]
      .filter((e) => {
        const searchText = search.toLowerCase();

        return (
          e.student_name?.toLowerCase().includes(searchText) ||
          e.course_name?.toLowerCase().includes(searchText)
        );
      })
      .sort((a, b) => {
        const idA = a.id || a.enrollment_id;
        const idB = b.id || b.enrollment_id;

        if (sort === "student")
          return (a.student_name || "").localeCompare(b.student_name || "");

        if (sort === "course")
          return (a.course_name || "").localeCompare(b.course_name || "");

        if (sort === "oldest") return idA - idB;

        return idB - idA;
      });
  }, [enrollments, search, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEnrollments.length / recordsPerPage)
  );

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;

  const currentEnrollments = filteredEnrollments.slice(
    indexOfFirst,
    indexOfLast
  );

  // AUTO PAGE FIX
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages]);

  // RESET PAGE
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">

        <h1 className="text-3xl font-bold text-gray-800">
          Enrollment Management
        </h1>

        <input
          type="text"
          placeholder="Search Student / Course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full md:w-72"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Course</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Payment</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {currentEnrollments.length > 0 ? (
              currentEnrollments.map((e) => (
                <tr
                  key={e.id || e.enrollment_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4 font-medium">
                    #{e.id || e.enrollment_id}
                  </td>

                  <td className="p-4">{e.student_name}</td>
                  <td className="p-4">{e.course_name}</td>

                  <td className="p-4">
                    {e.enrollment_date
                      ? new Date(e.enrollment_date).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        (e.payment_status || "pending").toLowerCase() === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {e.payment_status || "paid"}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() =>
                        handleDelete(e.id || e.enrollment_id)
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-10 text-gray-500">
                  No Enrollments Found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
     

{totalPages && (
  <div className="flex items-center justify-between mt-8 flex-wrap gap-4">

    {/* Previous */}

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

    {/* Page Numbers */}

    <div className="flex gap-2 flex-wrap justify-center">

      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 rounded-lg font-semibold transition ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        );
      })}

    </div>

    {/* Next */}

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

      {/* 🔥 UNDO TOAST */}
      {deletedItem && (
        <div className="fixed bottom-5 right-5 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-4">
          <span>Enrollment deleted</span>

          <button
            onClick={handleUndo}
            className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
          >
            Undo
          </button>
        </div>
      )}

    </div>
  );
}

export default EnrollmentPage;