import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudents,
  deleteStudent,
} from "../services/studentApi";

function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, [currentPage]);

  async function loadStudents() {
    try {
      const response = await getStudents(currentPage);

      setStudents(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error(err);
      setStudents([]);
    }
  }

  async function handleDelete(id) {
    await deleteStudent(id);
    loadStudents();
  }

  const filteredStudents = [...students]
    .filter((student) => {
      return (
        student.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        student.email
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sort === "oldest") {
        return a.id - b.id;
      }

      return b.id - a.id;
    });

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Students Management
          </h1>
          <p className="text-gray-500">
            Manage all registered students
          </p>
        </div>

        <button
          onClick={() => navigate("/pages/addStudent")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium shadow-lg"
        >
          + Add Student
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-gray-500">Current Page Records</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {students.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-gray-500">Search Results</p>
          <h2 className="text-3xl font-bold text-green-600">
            {filteredStudents.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <p className="text-gray-500">Total Pages</p>
          <h2 className="text-3xl font-bold text-purple-600">
            {totalPages}
          </h2>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-xl px-4 py-3 w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">
            Student List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b hover:bg-blue-50 transition"
                  >
                    <td className="p-4 font-medium">
                      #{student.id}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {student.name?.charAt(0)}
                        </div>

                        <span className="font-medium">
                          {student.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-600">
                      {student.email}
                    </td>

                    <td className="p-4 text-gray-600">
                      {student.phone}
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/student/edit-student/${student.id}`
                            )
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(student.id)
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
                    colSpan={5}
                    className="text-center p-10 text-gray-500"
                  >
                    No Students Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 p-5 border-t">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(currentPage - 1)
            }
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() =>
                setCurrentPage(index + 1)
              }
              className={`px-4 py-2 rounded-lg ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage(currentPage + 1)
            }
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>

        </div>
      </div>
    </div>
  );
}

export default StudentListPage;