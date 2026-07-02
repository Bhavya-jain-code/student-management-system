import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getClasses,
  deleteClass,
} from "../services/classApi";

function ClassesPage() {
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setLoading(true);

    try {
      const res = await getClasses();
      console.log(res);

      setClasses(res.data || []);
    } catch (err) {
      console.error(err);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm(
      "Are you sure you want to delete this class?"
    );

    if (!ok) return;

    try {
      await deleteClass(id);
      loadClasses();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  function getVideoSrc(videoUrl) {
    if (!videoUrl) return "";

    const iframeMatch = videoUrl.match(
      /src=["']([^"']+)["']/i
    );

    if (iframeMatch) {
      return iframeMatch[1];
    }

    const match = videoUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
    );

    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    return videoUrl;
  }

  function getThumbnail(videoUrl) {
    if (!videoUrl) return "";

    const match = videoUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
    );

    if (!match) return "";

    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      return (
        cls.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        cls.course_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        cls.description
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [classes, search]);

  const totalPages = Math.ceil(
    filteredClasses.length / itemsPerPage
  );

  const currentClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
    return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Classes Management
          </h1>

          <p className="text-gray-500 mt-1">
            Total Classes : {filteredClasses.length}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/add-class")}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Class
        </button>

      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by class, course or description..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-96 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-lg">
          Loading classes...
        </div>
      )}

      {/* Empty */}
      {!loading && currentClasses.length === 0 && (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <h2 className="text-xl font-semibold">
            No Classes Found
          </h2>

          <p className="text-gray-500 mt-2">
            Try another search keyword.
          </p>
        </div>
      )}

      {/* Cards */}
      {!loading && currentClasses.length > 0 && (

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {currentClasses.map((cls) => (

            <div
              key={cls.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden transition"
            >

              {cls.video_url ? (
                <img
                  src={getThumbnail(cls.video_url)}
                  alt={cls.title}
                  className="w-full h-52 object-cover"
                />
              ) : (
                <div className="h-52 bg-gray-200 flex items-center justify-center">
                  No Thumbnail
                </div>
              )}

              <div className="p-5">

                <h2 className="text-xl font-bold">
                  {cls.title}
                </h2>

                <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                  {cls.course_name}
                </span>

                <p className="text-gray-600 mt-3 line-clamp-3">
                  {cls.description}
                </p>

                {cls.video_url && (
                  <a
                    href={getVideoSrc(cls.video_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 text-blue-600 font-medium hover:underline"
                  >
                    ▶ Watch Video
                  </a>
                )}

                <div className="flex gap-2 mt-5">

                  <button
                    onClick={() =>
                      navigate(`/admin/edit-class/${cls.id}`)
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(cls.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (

        <div className="flex justify-center gap-2 mt-8 flex-wrap">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((p) => p - 1)
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, i) => (
              <button
                key={i}
                onClick={() =>
                  setCurrentPage(i + 1)
                }
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white border"
                }`}
              >
                {i + 1}
              </button>
            )
          )}

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((p) => p + 1)
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>

      )}

    </div>
  );
}

export default ClassesPage;