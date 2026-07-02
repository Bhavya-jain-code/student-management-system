import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosInstance";

function EditStudentProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const id = localStorage.getItem("student_id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/students/${id}`);
        const data = res?.data?.data;

        setForm({
          name: data?.name || "",
          email: data?.email || "",
          phone: data?.phone || "",
        });
      } catch (err) {
        console.log(err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.put(`/students/${id}`, form);

      alert("Profile updated successfully ✅");

      navigate("/profile");

    } catch (err) {
      console.log(err);
      alert("Error updating profile ❌");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Name"
          />

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Email"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Phone"
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default EditStudentProfile;