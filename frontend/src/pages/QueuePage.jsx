import { useEffect, useState } from "react";
import api from "../services/axiosInstance";

function QueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await api.get("/queue");
      setQueue(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessNext = async () => {
    try {
      const res = await api.post("/queue/process");

      alert(res.data.message || "Queue Item Processed");

      fetchQueue();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Loading Queue...</h2>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="bg-white rounded-2xl shadow-lg p-6">

        <h1 className="text-3xl font-bold mb-6">
          📋 Queue Management
        </h1>

        <div className="overflow-x-auto">

          <table className="min-w-full border border-gray-300">

            <thead className="bg-blue-600 text-white">

              <tr>
                <th className="px-4 py-3 border">#</th>
                <th className="px-4 py-3 border">Action</th>
                <th className="px-4 py-3 border">Student Name</th>
                <th className="px-4 py-3 border">Student ID</th>
                <th className="px-4 py-3 border">Time</th>
              </tr>

            </thead>

            <tbody>

              {queue.length > 0 ? (
                queue.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100"
                  >
                    <td className="border px-4 py-2 text-center">
                      {index + 1}
                    </td>

                    <td className="border px-4 py-2">

                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm
                        ${
                          item.action.includes("Added")
                            ? "bg-green-500"
                            : item.action.includes("Updated")
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      >
                        {item.action}
                      </span>

                    </td>

                    <td className="border px-4 py-2">
                      {item.name || "-"}
                    </td>

                    <td className="border px-4 py-2 text-center">
                      {item.studentId}
                    </td>

                    <td className="border px-4 py-2">
                      {new Date(item.time).toLocaleString()}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-6 text-gray-500"
                  >
                    Queue is Empty
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        <button
          onClick={handleProcessNext}
          disabled={queue.length === 0}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:bg-gray-400"
        >
          Process Next
        </button>

      </div>

    </div>
  );
}

export default QueuePage;