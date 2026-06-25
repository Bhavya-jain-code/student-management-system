import { useState } from "react";
import { addClass } from "../services/classApi";

function AddClass() {
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    video_url: "",
    description: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    await addClass(form);
    alert("Class Added!");
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Add New Class
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-2xl shadow"
      >
        <input
          placeholder="Course ID"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({
              ...form,
              course_id: e.target.value,
            })
          }
        />

        <input
          placeholder="Class Title"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <input
          placeholder="Video URL (YouTube embed)"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({
              ...form,
              video_url: e.target.value,
            })
          }
        />

        <textarea
          placeholder="Description"
          className="border p-2 w-full"
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
          Add Class
        </button>
      </form>
    </div>
  );
}

export default AddClass;