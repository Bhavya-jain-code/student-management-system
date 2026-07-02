import { useEffect, useMemo, useState } from "react";
import api from "../services/axiosInstance";

function EnrollStudentPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");

  const [paidAmount, setPaidAmount] = useState("");
  const [installments, setInstallments] = useState(4);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === Number(studentId));
  }, [studentId, students]);

  const selectedCourse = useMemo(() => {
    return courses.find((c) => c.id === Number(courseId));
  }, [courseId, courses]);

  const totalFee = Number(selectedCourse?.fee || 0);

  const remainingFee = Math.max(
    totalFee - Number(paidAmount || 0),
    0
  );
    // ENROLL STUDENT
  const handleEnroll = async () => {
    try {
      if (!studentId) {
        alert("Please select a student");
        return;
      }

      if (!courseId) {
        alert("Please select a course");
        return;
      }

      if (!paidAmount) {
        alert("Please enter admission payment");
        return;
      }

      if (Number(paidAmount) <= 0) {
        alert("Payment must be greater than 0");
        return;
      }

      if (Number(paidAmount) > totalFee) {
        alert("Admission payment cannot be greater than course fee");
        return;
      }

      await api.post("/EnrollStudent", {
        student_id: Number(studentId),
        course_id: Number(courseId),

        total_fee: totalFee,
        paid_amount: Number(paidAmount),
        remaining_fee: remainingFee,

        installments: Number(installments),

        payment_mode: paymentMode,
        transaction_id: transactionId,
      });

      alert("Student Enrolled Successfully");

      setStudentId("");
      setCourseId("");
      setPaidAmount("");
      setInstallments(4);
      setPaymentMode("Cash");
      setTransactionId("");

    } catch (err) {
      console.log(err);

      if (err.response?.status === 409) {
        alert("Student already enrolled in this course");
      } else {
        alert("Enrollment failed");
      }
    }
  };
    return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Enroll Student
          </h1>
          <p className="text-gray-500 mt-2">
            Enroll a student with admission payment
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Student */}
            <div>
              <label className="block font-semibold mb-2">
                Student
              </label>

              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full border rounded-xl p-3"
              >
                <option value="">Select Student</option>

                {students.map((student) => (
                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block font-semibold mb-2">
                Course
              </label>

              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full border rounded-xl p-3"
              >
                <option value="">Select Course</option>

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

            {/* Fee */}
            <div>
              <label className="block font-semibold mb-2">
                Course Fee
              </label>

              <input
                readOnly
                value={totalFee}
                className="w-full border rounded-xl p-3 bg-gray-100"
              />
            </div>

            {/* Admission */}
            <div>
              <label className="block font-semibold mb-2">
                Admission Payment
              </label>

              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full border rounded-xl p-3"
              />
            </div>

            {/* Remaining */}
            <div>
              <label className="block font-semibold mb-2">
                Remaining Fee
              </label>

              <input
                readOnly
                value={remainingFee}
                className="w-full border rounded-xl p-3 bg-gray-100"
              />
            </div>

            {/* Installments */}
            <div>
              <label className="block font-semibold mb-2">
                Installments
              </label>

              <input
                type="number"
                min="1"
                value={installments}
                onChange={(e) =>
                  setInstallments(e.target.value)
                }
                className="w-full border rounded-xl p-3"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block font-semibold mb-2">
                Payment Mode
              </label>

              <select
                value={paymentMode}
                onChange={(e) =>
                  setPaymentMode(e.target.value)
                }
                className="w-full border rounded-xl p-3"
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Bank</option>
              </select>
            </div>

            {/* Transaction */}
            <div>
              <label className="block font-semibold mb-2">
                Transaction ID
              </label>

              <input
                value={transactionId}
                onChange={(e) =>
                  setTransactionId(e.target.value)
                }
                className="w-full border rounded-xl p-3"
                placeholder="Optional"
              />
            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleEnroll}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl"
            >
              Enroll Student
            </button>
          </div>

        </div>
      </div>
    </div>
  );
  }

export default EnrollStudentPage;