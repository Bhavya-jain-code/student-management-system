import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getClasses,
  deleteClass,
} from "../services/classApi";

function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setLoading(true);
    try {
      const res = await getClasses();
      console.log("CLASSES API Response:", res);

      setClasses(res?.data || []);
    } catch (err) {
      console.error(err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }

  function getVideoSrc(videoUrl) {
    if (!videoUrl) return null;

    const iframeMatch = videoUrl.match(/src=["']([^"']+)["']/i);
    if (iframeMatch) {
      return iframeMatch[1];
    }

    const watchIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/);
    if (watchIdMatch) {
      return `https://www.youtube.com/embed/${watchIdMatch[1]}`;
    }

    return videoUrl;
  }

  async function handleDelete(classId) {
    if (!window.confirm("Are you sure?")) return;

    try {
      await deleteClass(classId);
      loadClasses();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Classes Management
        </h1>

        {/* ADD CLASS BUTTON */}
        <button
          onClick={() => navigate("/admin/add-class")}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          + Add Class
        </button>

      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-600">
          Loading classes...
        </p>
      )}

      {/* EMPTY */}
      {!loading && classes.length === 0 && (
        <p className="text-center text-gray-600">
          No classes found
        </p>
      )}

      {/* GRID */}
      {!loading && classes.length > 0 && (
        <div className="grid md:grid-cols-3 gap-5">

          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl shadow p-4"
            >
              <h2 className="font-bold text-lg">
                {cls.title}
              </h2>

              <p className="text-sm text-gray-500">
                Course: {cls.course_name}
              </p>

              <p className="text-sm mt-2">
                {cls.description}
              </p>

              {cls.video_url && (
                <iframe
                  className="w-full mt-3 rounded-xl"
                  height="180"
                  src={getVideoSrc(cls.video_url)}
                  title="video"
                  allowFullScreen
                />
              )}

              <div className="flex gap-2 mt-4">

               

                <button
                  onClick={() => handleDelete(cls.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg"
                >
                  Delete
                </button>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default ClassesPage;