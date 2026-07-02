import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/axiosInstance";

function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const id = localStorage.getItem("student_id");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return alert("Passwords do not match ❌");
    }

    if (form.newPassword.length < 6) {
      return alert("Password must be at least 6 characters ❌");
    }

    try {
      setLoading(true);

      await api.put(`/students/${id}/password`, {
  oldPassword: form.oldPassword,
  newPassword: form.newPassword,
});

      alert("Password changed successfully ✅");
      navigate("/profile");

    } catch (err) {
      console.log(err);
      alert("Incorrect old password or server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6">Change Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            name="oldPassword"
            placeholder="Old Password"
            value={form.oldPassword}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default ChangePassword;