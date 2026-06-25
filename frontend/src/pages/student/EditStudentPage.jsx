import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getStudentById,
  updateStudent,
} from "../../services/studentApi";

function EditStudentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    try {
     const response = await getStudentById(id);
 console.log("GET STUDENT:", response.data);

setForm({
  name: response.data.data.name || "",
  email: response.data.data.email || "",
  phone: response.data.data.phone || "",
});
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await updateStudent(id, form);

      alert("Student Updated Successfully");

      navigate("/admin/students");
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">
          Edit Student
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>Name</label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label>Phone</label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            Update Student
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditStudentPage;