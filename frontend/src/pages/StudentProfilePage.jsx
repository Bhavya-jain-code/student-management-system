import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosInstance";

function StudentProfilePage() {
  const [student, setStudent] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = localStorage.getItem("student_id");

        console.log("Student ID:", id);

        const studentRes = await api.get(`/students/${id}`);
        const courseRes = await api.get(`/student/${id}/courses`);

        console.log("Student API:", studentRes.data);
        console.log("Course API:", courseRes.data);

        setStudent(studentRes?.data?.data || {});

        // SAFE FIX
        setCourses(
          Array.isArray(courseRes?.data)
            ? courseRes.data
            : courseRes?.data?.data || []
        );

      } catch (err) {
        console.log("PROFILE ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* SAFE RENDER (NO CRASH EVER) */}
      {!student?.name ? (
        <div className="text-red-500">
          Student data not loaded (check API)
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow">

          {/* HEADER */}
          <div className="bg-blue-600 text-white p-6 rounded-t-xl">
            <h1 className="text-2xl font-bold">{student?.name}</h1>
            <p>{student?.email}</p>

            <div className="mt-4 flex gap-3">
              <button onClick={() => navigate("/edit-profile")}>
                Edit Profile
              </button>

              <button onClick={() => navigate("/change-password")}>
                Change Password
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="p-6">
            <p><b>Phone:</b> {student?.phone}</p>
            <p><b>Status:</b> {student?.status || "Active"}</p>

            <b>Courses:</b>
            <ul className="list-disc ml-5">
              {courses?.map((c, i) => (
                <li key={i}>{c?.title || "No title"}</li>
              ))}
            </ul>
          </div>

        </div>
      )}

    </div>
  );
}

export default StudentProfilePage;