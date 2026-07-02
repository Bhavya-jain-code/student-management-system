import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudents,
  deleteStudent,
  undoStudent,
} from "../services/studentApi";

function StudentListPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const [deletedStudent, setDeletedStudent] = useState(null);
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [currentPage, search, sort]);

  async function loadStudents() {
    setLoading(true);

    try {
      const res = await getStudents(currentPage, search, sort);

      setStudents(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalStudents(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(student) {
    try {
      await deleteStudent(student.id);

      setDeletedStudent(student);

      setStudents((prev) => prev.filter((s) => s.id !== student.id));

      setShowUndo(true);

      setTimeout(() => {
        setShowUndo(false);
        setDeletedStudent(null);
      }, 8000);
    } catch (err) {
      console.error(err);
    }
  }

  async function undoDelete() {
    if (!deletedStudent) return;

    try {
      await undoStudent(deletedStudent.id);

      loadStudents();

      setDeletedStudent(null);
      setShowUndo(false);
    } catch (err) {
      console.error(err);
      alert("Undo failed");
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (statusFilter === "all") return true;
      return s.status === statusFilter;
    });
  }, [students, statusFilter]);

  const startRecord =
    totalStudents === 0 ? 0 : (currentPage - 1) * 5 + 1;

  const endRecord = Math.min(currentPage * 5, totalStudents);

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Students
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all students
          </p>
        </div>

        <button
          onClick={() => navigate("/pages/addStudent")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow"
        >
          + Add Student
        </button>

      </div>

      {/* Undo */}

      {showUndo && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 flex justify-between items-center mb-5">

          <span>
            Student deleted successfully.
          </span>

          <button
            onClick={undoDelete}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Undo
          </button>

        </div>
      )}

      {/* Filters */}

      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setCurrentPage(1);
            setSearch(e.target.value);
          }}
          className="border rounded-xl p-3"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-xl p-3"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setCurrentPage(1);
            setSort(e.target.value);
          }}
          className="border rounded-xl p-3"
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </select>

      </div>

      <div className="flex justify-between items-center mb-4">

        <p className="text-gray-600">
          Showing <b>{startRecord}</b> - <b>{endRecord}</b> of{" "}
          <b>{totalStudents}</b> students
        </p>

        <p className="text-gray-600">
          Page <b>{currentPage}</b> / <b>{totalPages}</b>
        </p>

      </div>

      {/* TABLE */}
            <div className="bg-white rounded-xl shadow overflow-hidden">

        {loading ? (
          <div className="p-10 text-center text-lg font-medium">
            Loading...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No Students Found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s) => (
                <tr
                  key={s.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4">{s.id}</td>
                  <td className="p-4 font-medium">{s.name}</td>
                  <td className="p-4">{s.email}</td>
                  <td className="p-4">{s.phone}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        s.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/profile/${s.id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
                      >
                        Profile
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/student/edit-student/${s.id}`)
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(s)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}

      {!loading && (
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
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-semibold ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white border hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              );
            })}
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

export default StudentListPage;