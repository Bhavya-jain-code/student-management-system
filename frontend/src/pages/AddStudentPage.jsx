import { useState } from "react";
import { addStudent } from "../services/studentApi";
function AddStudentPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function validateForm() {
    const emailRegex = /\S+@\S+\.\S+/;

    if (!formData.name.trim()) {
      alert("Name is required");
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      alert("Enter valid email");
      return false;
    }

    if (formData.phone.length < 10) {
      alert("Enter valid phone number");
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log("Submitting:", formData);

      // 🔥 API CALL (uncomment when backend ready)
      await addStudent(formData);

      alert("Student added successfully");

      // reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

 return (

  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-3xl mx-auto">

```
  {/* Header */}
  <div className="mb-6">
    <h1 className="text-3xl font-bold text-gray-800">
      Add New Student
    </h1>
    <p className="text-gray-500 mt-1">
      Fill student details to register in system
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {/* Form */}
    <div className="md:col-span-2 bg-white shadow-lg rounded-2xl p-6">

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">
            Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter student name"
            className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">
            Address
          </label>

          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
            className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">
            Status
          </label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
        >
          {loading ? "Saving Student..." : "Save Student"}
        </button>
      </form>
    </div>

    {/* Live Preview Card */}
    <div className="bg-white shadow-lg rounded-2xl p-6 h-fit">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Live Preview
      </h2>

      <div className="space-y-3 text-gray-700">
        <p>
          <span className="font-semibold">Name:</span>{" "}
          {formData.name || "Not entered"}
        </p>

        <p>
          <span className="font-semibold">Email:</span>{" "}
          {formData.email || "Not entered"}
        </p>

        <p>
          <span className="font-semibold">Phone:</span>{" "}
          {formData.phone || "Not entered"}
        </p>

        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={`px-2 py-1 rounded text-white text-sm ${
              formData.status === "active"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          >
            {formData.status}
          </span>
        </p>
      </div>
    </div>

  </div>
</div>
```

  </div>
);

}

export default AddStudentPage;