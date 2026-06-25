import { useState, useEffect } from "react";
import { getEnrollments } from "../services/enrollmentApi";

function EnrollmentPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");

  useEffect(() => {
    loadEnrollments();
  }, []);

  async function loadEnrollments() {
    try {
      const data = await getEnrollments();

      console.log(data);

      setEnrollments(data);
    } catch (error) {
      console.error(error);
    }
  }

  const filteredEnrollments = [...enrollments]
    .filter((enrollment) => {
      return (
        enrollment.student_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        enrollment.course_name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sort === "student") {
        return a.student_name.localeCompare(b.student_name);
      }

      if (sort === "course") {
        return a.course_name.localeCompare(b.course_name);
      }

      if (sort === "oldest") {
        return a.id - b.id;
      }

      return b.id - a.id;
    });

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Enrollment Management
          </h1>

          <p className="text-gray-500 mt-1">
            Track student course enrollments
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-gray-500">Total Enrollments</p>
          <h2 className="text-3xl font-bold text-blue-600">
            {enrollments.length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-gray-500">Showing Results</p>
          <h2 className="text-3xl font-bold text-green-600">
            {filteredEnrollments.length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-gray-500">Database Records</p>
          <h2 className="text-3xl font-bold text-purple-600">
            {enrollments.length}
          </h2>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <input
          type="text"
          placeholder="Search by student or course..."
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
          <option value="student">Student A-Z</option>
          <option value="course">Course A-Z</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">
            Enrollment List
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">

            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Course</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="border-b hover:bg-blue-50 transition"
                  >
                    <td className="p-4 font-medium">
                      #{enrollment.id}
                    </td>

                    <td className="p-4 font-medium text-gray-800">
                      {enrollment.student_name}
                    </td>

                    <td className="p-4 text-gray-600">
                      {enrollment.course_name}
                    </td>

                    <td className="p-4 text-gray-600">
                      {new Date(
                        enrollment.enrollment_date
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-sm bg-green-500 text-white">
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-10 text-gray-500"
                  >
                    No Enrollments Found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}

export default EnrollmentPage;