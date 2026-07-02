import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPayments,
  deletePayment,
  undoPayment,
} from "../services/paymentApi";

function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [deletedItem, setDeletedItem] = useState(null);
  const [showUndo, setShowUndo] = useState(false);

  const navigate = useNavigate();
  const rowsPerPage = 5;

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      const data = await getPayments();
      setPayments(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(item) {
    if (!item?.id) return;

    try {
      await deletePayment(item.id);

      setPayments((prev) => prev.filter((p) => p.id !== item.id));

      setDeletedItem(item);
      setShowUndo(true);

      setTimeout(() => {
        setDeletedItem(null);
        setShowUndo(false);
      }, 5000);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUndo() {
    if (!deletedItem) return;

    try {
      await undoPayment(deletedItem.id);

      loadPayments();

      setDeletedItem(null);
      setShowUndo(false);
    } catch (err) {
      console.error(err);
    }
  }

  const filteredPayments = payments.filter((p) => {
    const keyword = search.toLowerCase();

    return (
      p.student_name?.toLowerCase().includes(keyword) ||
      p.course_name?.toLowerCase().includes(keyword) ||
      p.amount?.toString().includes(search) ||
      p.payment_date?.split("T")[0].includes(search)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / rowsPerPage)
  );

  const currentPayments = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredPayments.slice(start, start + rowsPerPage);
  }, [filteredPayments, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Payment History
          </h1>

          <p className="text-slate-500">
            View complete student payment transactions
          </p>
        </div>

        <button
          onClick={() => navigate("/pages/addpayment")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow font-medium"
        >
          + Add Payment
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4 mb-5">
        <input
          type="text"
          placeholder="Search by student, course, amount or date..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-slate-800 text-white">

            <tr>

              <th className="px-5 py-4 text-left">Payment ID</th>

              <th className="px-5 py-4 text-left">Student</th>

              <th className="px-5 py-4 text-left">Course</th>

              <th className="px-5 py-4 text-right">Course Fee</th>

              <th className="px-5 py-4 text-right">Payment</th>

              <th className="px-5 py-4 text-right">Total Paid</th>

              <th className="px-5 py-4 text-right">Remaining</th>

              <th className="px-5 py-4 text-center">Date</th>

              <th className="px-5 py-4 text-center">Status</th>

              <th className="px-5 py-4 text-center">Action</th>

            </tr>

          </thead>

          <tbody>
            {currentPayments.length > 0 ? (
  currentPayments.map((item) => (
    <tr
      key={item.id}
      className="border-b hover:bg-slate-50 transition"
    >
      <td className="px-5 py-4 font-semibold text-slate-700">
        #{item.id}
      </td>

      <td className="px-5 py-4">
        {item.student_name}
      </td>

      <td className="px-5 py-4">
        {item.course_name}
      </td>

      <td className="px-5 py-4 text-right font-semibold">
        ₹{Number(item.course_fee || 0).toLocaleString("en-IN")}
      </td>

      <td className="px-5 py-4 text-right font-bold text-green-600">
        ₹{Number(item.amount || 0).toLocaleString("en-IN")}
      </td>

      <td className="px-5 py-4 text-right font-semibold text-blue-600">
        ₹{Number(item.total_paid || 0).toLocaleString("en-IN")}
      </td>

      <td
        className={`px-5 py-4 text-right font-bold ${
          Number(item.remaining_amount) === 0
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        ₹{Number(item.remaining_amount || 0).toLocaleString("en-IN")}
      </td>

      <td className="px-5 py-4 text-center">
        {new Date(item.payment_date).toLocaleDateString("en-IN")}
      </td>

      <td className="px-5 py-4 text-center">
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
            item.status?.toLowerCase() === "paid"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {item.status}
        </span>
      </td>

      <td className="px-5 py-4 text-center">
        <button
          onClick={() => handleDelete(item)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Delete
        </button>
      </td>
    </tr>
  ))
) : (
  <tr>
    <td
      colSpan="10"
      className="text-center py-10 text-gray-500"
    >
      No Payment History Found
    </td>
  </tr>
)}

</tbody>
</table>
</div>

{/* Undo */}

{showUndo && (
 <div className="fixed bottom-5 right-5 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-4">
    <span>Payment deleted successfully.</span>

    <button
      onClick={handleUndo}
      className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-lg font-semibold"
    >
      Undo
    </button>
  </div>
)}

{/* Pagination */}

<div className="flex justify-between items-center mt-6 bg-white rounded-xl shadow p-4">

  <button
    onClick={() =>
      setCurrentPage((p) => Math.max(1, p - 1))
    }
    disabled={currentPage === 1}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
  >
    ◀ Previous
  </button>

  <span className="font-medium text-slate-700">
    Page {currentPage} of {totalPages}
  </span>

  <button
    onClick={() =>
      setCurrentPage((p) => Math.min(totalPages, p + 1))
    }
    disabled={currentPage === totalPages}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
  >
    Next ▶
  </button>

</div>

</div>
);
}

export default PaymentPage;