import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCourses } from "../services/courseApi";
import {
  getClassById,
  updateClass,
} from "../services/classApi";

function EditClass() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    course_id: "",
    title: "",
    video_url: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [courseList, classData] = await Promise.all([
        getCourses(),
        getClassById(id),
      ]);

      setCourses(courseList || []);

      setForm({
        course_id: classData.course_id || "",
        title: classData.title || "",
        video_url: classData.video_url || "",
        description: classData.description || "",
      });
    } catch (err) {
      console.error(err);
      alert("Unable to load class details.");
      navigate("/admin/classes");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.course_id || !form.title.trim()) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);

      await updateClass(id, form);

      alert("Class updated successfully.");

      navigate("/admin/classes");
    } catch (err) {
      console.error(err);
      alert("Failed to update class.");
    } finally {
      setSaving(false);
    }
  }

  function getPreviewUrl(url) {
    if (!url) return "";

    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
    );

    return match
      ? `https://www.youtube.com/embed/${match[1]}`
      : url;
  }
    if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-xl font-semibold">Loading class...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 text-white px-8 py-5">
          <h2 className="text-3xl font-bold">
            Edit Class
          </h2>

          <p className="text-blue-100 mt-1">
            Update class details and video information.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6"
        >

          {/* Course */}
          <div>
            <label className="block font-semibold mb-2">
              Course
            </label>

            <select
              name="course_id"
              value={form.course_id}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">
                Select Course
              </option>

              {courses.map((course) => (
                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold mb-2">
              Class Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter class title"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Video URL */}
          <div>
            <label className="block font-semibold mb-2">
              YouTube Video URL
            </label>

            <input
              type="text"
              name="video_url"
              value={form.video_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Video Preview */}
          {form.video_url && (
            <div>
              <label className="block font-semibold mb-2">
                Video Preview
              </label>

              <iframe
                title="Class Video"
                src={getPreviewUrl(form.video_url)}
                className="w-full rounded-xl border"
                height="300"
                allowFullScreen
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-semibold mb-2">
              Description
            </label>

            <textarea
              name="description"
              rows="5"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter class description..."
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Class"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/classes")}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditClass;