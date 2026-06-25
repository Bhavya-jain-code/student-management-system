import { useState } from "react";
import api from "../services/axiosInstance";

function AddCoursePage() {
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    fee: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await api.post("/courses", formData);

      setSuccess(true);

      setFormData({
        title: "",
        duration: "",
        fee: "",
        status: "Active",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.log(err);
      alert("Failed To Add Course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            ➕ Add New Course
          </h1>
          <p className="text-gray-500">
            Create dynamic courses for students
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl">
            ✅ Course Added Successfully!
          </div>
        )}

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-8">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* TITLE */}
            <input
              name="title"
              placeholder="Course Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            {/* DURATION */}
            <input
              name="duration"
              placeholder="Duration (e.g. 3 Months)"
              value={formData.duration}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            {/* FEE */}
            <input
              name="fee"
              type="number"
              placeholder="Course Fee"
              value={formData.fee}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />

            {/* STATUS */}
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border p-3 rounded-xl"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* LIVE PREVIEW */}
            <div className="bg-gray-50 p-4 rounded-xl border">
              <h3 className="font-semibold mb-2">📘 Live Preview</h3>
              <p><b>Title:</b> {formData.title || "Not set"}</p>
              <p><b>Duration:</b> {formData.duration || "Not set"}</p>
              <p><b>Fee:</b> ₹{formData.fee || 0}</p>
              <p><b>Status:</b> {formData.status}</p>
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              className={`w-full py-3 rounded-xl text-white font-semibold transition ${
                loading
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Adding..." : "Add Course"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCoursePage;