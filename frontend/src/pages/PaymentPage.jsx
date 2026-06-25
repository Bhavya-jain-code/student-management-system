import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPayments,
  deletePayment,
} from "../services/paymentApi";

function PaymentPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadPayments();
  }, []);
const navigate = useNavigate();
  async function loadPayments() {
    try {
      const data = await getPayments();
      setPayments(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id) {
    try {
      await deletePayment(id);
      loadPayments();
    } catch (error) {
      console.error(error);
    }
  }

  return (

  <div className="min-h-screen bg-gray-100 p-6">

```
{/* Header */}
<div className="flex justify-between items-center mb-6">
  <div>
    <h1 className="text-3xl font-bold text-gray-800">
      Payment Management
    </h1>
    <p className="text-gray-500 mt-1">
      Track all student payments
    </p>
  </div>
   <button  
      onClick={() => navigate("/pages/addpayment")}
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium shadow-lg"
>
  + Add Payment
  </button>
</div>

{/* Stats */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
  <div className="bg-white p-5 rounded-2xl shadow">
    <p className="text-gray-500">Total Payments</p>
    <h2 className="text-3xl font-bold text-blue-600">
      {payments.length}
    </h2>
  </div>

  <div className="bg-white p-5 rounded-2xl shadow">
    <p className="text-gray-500">Paid</p>
    <h2 className="text-3xl font-bold text-green-600">
      {
        payments.filter(
          (p) => p.status === "Paid"
        ).length
      }
    </h2>
  </div>

  <div className="bg-white p-5 rounded-2xl shadow">
    <p className="text-gray-500">Pending</p>
    <h2 className="text-3xl font-bold text-red-600">
      {
        payments.filter(
          (p) => p.status === "Pending"
        ).length
      }
    </h2>
  </div>
</div>

{/* Table */}
<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
  <div className="p-5 border-b">
    <h2 className="text-xl font-semibold">
      Payment List
    </h2>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">

      <thead>
        <tr className="bg-gray-100 text-gray-700">
          <th className="p-4 text-left">ID</th>
          <th className="p-4 text-left">Student</th>
          <th className="p-4 text-left">Course</th>
          <th className="p-4 text-left">Amount</th>
          <th className="p-4 text-left">Date</th>
          <th className="p-4 text-left">Status</th>
          <th className="p-4 text-center">Action</th>
        </tr>
      </thead>

      <tbody>
        {payments.length > 0 ? (
          payments.map((item) => (
            <tr
              key={item.id}
              className="border-b hover:bg-blue-50 transition"
            >
              <td className="p-4 font-medium">
                #{item.id}
              </td>

              <td className="p-4">
                {item.student_name}
              </td>

              <td className="p-4 text-gray-600">
                {item.course_name}
              </td>

              <td className="p-4 font-semibold text-green-600">
                ₹{item.amount}
              </td>

              <td className="p-4 text-gray-600">
                {item.payment_date?.split("T")[0]}
              </td>

              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm text-white ${
                    item.status === "Paid"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {item.status}
                </span>
              </td>

              <td className="p-4 text-center">
                <button
                  onClick={() =>
                    handleDelete(item.id)
                  }
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
              colSpan={7}
              className="text-center p-10 text-gray-500"
            >
              No Payments Found
            </td>
          </tr>
        )}
      </tbody>

    </table>
  </div>
</div>
```

  </div>
);

}

export default PaymentPage;