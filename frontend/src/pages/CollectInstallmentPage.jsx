import { useEffect, useMemo, useState } from "react";
import api from "../services/axiosInstance";

function CollectInstallmentPage() {
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Row-wise payment details
  const [paymentData, setPaymentData] = useState({});

  useEffect(() => {
    loadInstallments();
  }, []);

  const loadInstallments = async () => {
    try {
      setLoading(true);

      const res = await api.get("/installments");

      setInstallments(res.data || []);
    } catch (err) {
      console.log(err);
      alert("Failed to load installments");
    } finally {
      setLoading(false);
    }
  };

  const filteredInstallments = useMemo(() => {
    return installments.filter((item) => {
      const matchesSearch =
        item.student_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.course_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All"
          ? true
          : item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [installments, search, statusFilter]);

  // Dashboard Cards
  const totalInstallments = installments.length;

  const paidInstallments = installments.filter(
    (i) => i.status === "Paid"
  ).length;

  const pendingInstallments = installments.filter(
    (i) => i.status !== "Paid"
  ).length;

  const totalPendingAmount = installments
    .filter((i) => i.status !== "Paid")
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInstallments.length / recordsPerPage)
  );

  const currentRecords = filteredInstallments.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const updatePaymentField = (id, field, value) => {
    setPaymentData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handlePayment = async (installment) => {
    try {
      const paymentMode =
        paymentData[installment.id]?.paymentMode || "Cash";

      const transactionId =
        paymentData[installment.id]?.transactionId || "";

      await api.post("/installments/pay", {
        installment_id: installment.id,
        payment_mode: paymentMode,
        transaction_id: transactionId,
      });

      alert("Installment Collected Successfully");

      setPaymentData((prev) => {
        const copy = { ...prev };
        delete copy[installment.id];
        return copy;
      });

      loadInstallments();
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Payment Failed"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-purple-700">
          Loading Installments...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Collect Installments
            </h1>

            <p className="text-gray-500 mt-1">
              Manage pending and paid installment payments
            </p>
          </div>

        </div>

        {/* DASHBOARD CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">
              Total Installments
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {totalInstallments}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">
              Paid
            </p>

            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {paidInstallments}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">
              Pending
            </p>

            <h2 className="text-3xl font-bold text-red-600 mt-2">
              {pendingInstallments}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">
              Pending Amount
            </p>

            <h2 className="text-3xl font-bold text-purple-700 mt-2">
              ₹{totalPendingAmount}
            </h2>
          </div>

        </div>

        {/* SEARCH & FILTER */}

        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <input
              type="text"
              placeholder="Search Student or Course..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>

          </div>

        </div>

        {/* TABLE */}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          <div className="overflow-x-auto">

            <table className="min-w-full">
                              <thead className="bg-purple-600 text-white">

                <tr>

                  <th className="p-3 text-left">Student</th>

                  <th className="p-3 text-left">Course</th>

                  <th className="p-3 text-center">Installment</th>

                  <th className="p-3 text-center">Amount</th>

                  <th className="p-3 text-center">Due Date</th>

                  <th className="p-3 text-center">Status</th>

                  <th className="p-3 text-center">Payment</th>

                </tr>

              </thead>

              <tbody>

                {currentRecords.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-12 text-gray-500"
                    >
                      No Installments Found
                    </td>

                  </tr>

                ) : (

                  currentRecords.map((item) => (

                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50 transition"
                    >

                      <td className="p-4 font-medium">
                        {item.student_name}
                      </td>

                      <td className="p-4">
                        {item.course_name}
                      </td>

                      <td className="p-4 text-center font-semibold">
                        #{item.installment_no}
                      </td>

                      <td className="p-4 text-center font-bold text-purple-700">
                        ₹{Number(item.amount).toLocaleString()}
                      </td>

                      <td className="p-4 text-center">
                        {item.due_date
                          ? new Date(item.due_date).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-4 text-center">

                        {item.status === "Paid" ? (

                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                            Paid
                          </span>

                        ) : (

                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                            Pending
                          </span>

                        )}

                      </td>

                      <td className="p-4">

                        {item.status === "Paid" ? (

                          <div className="text-center text-green-600 font-semibold">
                            ✔ Already Paid
                          </div>

                        ) : (

                          <div className="space-y-2">

                            <select
                              value={
                                paymentData[item.id]?.paymentMode || "Cash"
                              }
                              onChange={(e) =>
                                updatePaymentField(
                                  item.id,
                                  "paymentMode",
                                  e.target.value
                                )
                              }
                              className="w-full border rounded-lg p-2"
                            >
                              <option>Cash</option>
                              <option>UPI</option>
                              <option>Card</option>
                              <option>Bank</option>
                            </select>

                            <input
                              type="text"
                              placeholder="Transaction ID"
                              value={
                                paymentData[item.id]?.transactionId || ""
                              }
                              onChange={(e) =>
                                updatePaymentField(
                                  item.id,
                                  "transactionId",
                                  e.target.value
                                )
                              }
                              className="w-full border rounded-lg p-2"
                            />

                            <button
                              onClick={() => handlePayment(item)}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition"
                            >
                              Collect Payment
                            </button>

                          </div>

                        )}

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>
                  {/* Pagination */}
        <div className="flex items-center justify-between p-5 border-t bg-gray-50">

          <p className="text-sm text-gray-600">
            Showing {currentRecords.length} of {filteredInstallments.length} records
          </p>

          <div className="flex gap-2">

            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === 1
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Previous
            </button>

            <div className="px-4 py-2 bg-purple-600 text-white rounded-lg">
              {currentPage} / {totalPages}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === totalPages
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Next
            </button>

          </div>

        </div>

      </div>

    </div>

    </div>
  );
}

export default CollectInstallmentPage;