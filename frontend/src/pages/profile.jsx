import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

function Profile() {
  const { id } = useParams();

  const [student, setStudent] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!id) {
          setError("Invalid Student ID");
          return;
        }

        const studentRes = await api.get(`/students/${id}`);
        const courseRes = await api.get(`/student/${id}/courses`);

        setStudent(studentRes?.data?.data || {});
        setCourses(
          Array.isArray(courseRes?.data)
            ? courseRes.data
            : courseRes?.data?.data || []
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-2xl font-bold text-gray-500 animate-pulse">
          Loading Profile...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <h2 className="text-red-600 text-xl font-bold">{error}</h2>
      </div>
    );
  }

  const totalPaid = courses.reduce(
    (sum, c) => sum + Number(c.amount || 0),
    0
  );

  const totalRemaining = courses.reduce(
    (sum, c) => sum + Number(c.remaining_amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-5">
      <div className="max-w-7xl mx-auto">

        {/* Profile */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 text-white p-8 flex flex-col md:flex-row gap-6 items-center">

            <div className="w-28 h-28 rounded-full bg-white text-blue-700 flex items-center justify-center text-5xl font-bold shadow-lg">
              {student?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>

            <div className="flex-1">

              <h1 className="text-4xl font-bold">
                {student?.name}
              </h1>

              <p className="text-blue-100 mt-1">
                {student?.email}
              </p>

              <div className="flex flex-wrap gap-3 mt-5">

                <span className="bg-white/20 px-4 py-2 rounded-full">
                  🆔 {student?.id}
                </span>

                <span className="bg-white/20 px-4 py-2 rounded-full">
                  📞 {student?.phone || "N/A"}
                </span>

                <span
                  className={`px-4 py-2 rounded-full font-semibold ${
                    student?.status === "active"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {student?.status?.toUpperCase()}
                </span>

              </div>

            </div>

          </div>

          {/* Statistics */}

          <div className="grid md:grid-cols-3 gap-6 p-8">

            <div className="bg-blue-50 rounded-2xl p-6 shadow">

              <p className="text-gray-500">
                Total Courses
              </p>

              <h2 className="text-4xl font-bold text-blue-700 mt-2">
                {courses.length}
              </h2>

            </div>

            <div className="bg-green-50 rounded-2xl p-6 shadow">

              <p className="text-gray-500">
                Total Paid
              </p>

              <h2 className="text-3xl font-bold text-green-600 mt-2">
                ₹{totalPaid.toLocaleString("en-IN")}
              </h2>

            </div>

            <div className="bg-red-50 rounded-2xl p-6 shadow">

              <p className="text-gray-500">
                Remaining Amount
              </p>

              <h2 className="text-3xl font-bold text-red-600 mt-2">
                ₹{totalRemaining.toLocaleString("en-IN")}
              </h2>

            </div>

          </div>

        </div>

        {/* Course Section */}

        <div className="mt-10 bg-white rounded-3xl shadow-xl p-8">

          <div className="flex justify-between items-center mb-8">

            <h2 className="text-3xl font-bold">
              📚 Enrolled Courses
            </h2>

            <span className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-semibold">
              {courses.length} Courses
            </span>

          </div>

          {courses.length === 0 ? (
            <div className="text-center py-14 text-gray-500 text-lg">
              No Courses Found
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">

              {courses.map((course, index) => {
                const fee = Number(course.fee || 0);
                const paid = Number(course.amount || 0);
                const remaining = Number(course.remaining_amount || 0);

                const progress =
                  fee > 0
                    ? Math.min((paid / fee) * 100, 100)
                    : 0;

                return (
                  <div
                    key={course.enrollment_id}
                    className="border rounded-3xl p-6 bg-white shadow hover:shadow-2xl transition duration-300"
                  >
                    <div className="flex justify-between">

                      <h3 className="text-2xl font-bold text-blue-700">
                        {course.title}
                      </h3>

                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        #{index + 1}
                      </span>

                    </div>

                    <div className="mt-6 space-y-4 text-sm">

                      <div className="flex justify-between">
                        <span>📅 Duration</span>
                        <span className="font-semibold">
                          {course.duration}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>💰 Course Fee</span>
                        <span className="font-bold text-green-600">
                          ₹{fee.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>💵 Paid</span>
                        <span className="font-bold text-blue-600">
                          ₹{paid.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>🧾 Remaining</span>

                        <span
                          className={`font-bold ${
                            remaining === 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ₹{remaining.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>📆 Payment Date</span>

                        <span className="font-semibold">
                          {course.payment_date
                            ? new Date(
                                course.payment_date
                              ).toLocaleDateString("en-IN")
                            : "Not Paid"}
                        </span>
                      </div>

                    </div>

                    {/* Progress */}

                    <div className="mt-6">

                      <div className="flex justify-between mb-2 text-sm">

                        <span className="font-semibold">
                          Payment Progress
                        </span>

                        <span className="font-bold">
                          {progress.toFixed(0)}%
                        </span>

                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3">

                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />

                      </div>

                    </div>

                    <div className="mt-6">

                      {remaining === 0 ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">

                          <p className="font-bold text-green-700 text-lg">
                            ✅ Payment Completed
                          </p>

                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">

                          <p className="font-bold text-red-700 text-lg">
                            ₹{remaining.toLocaleString("en-IN")} Pending
                          </p>

                        </div>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default Profile;