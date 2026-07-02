import { useEffect, useState } from "react";
import api from "../../services/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function MyCoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);

      const studentId = localStorage.getItem("student_id");

      const [allCoursesRes, enrolledCoursesRes] = await Promise.all([
        api.get("/courses"),
        studentId
          ? api.get(`/student/${studentId}/courses`)
          : Promise.resolve({ data: [] }),
      ]);

      const allCourses = allCoursesRes?.data || [];
      const enrolledCourses = enrolledCoursesRes?.data || [];

      const enrolledIds = new Set(
        enrolledCourses.map((c) =>
          String(c.course_id || c.id || c._id)
        )
      );

      const merged = allCourses.map((course) => {
        const id = String(course.id || course._id);

        return {
          ...course,
          id,
          isEnrolled: enrolledIds.has(id),
        };
      });

      setCourses(merged);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCheckout = (course) => {
    setSelectedCourse(course);
    setPaymentAmount(course.fee ? String(course.fee) : "0");
  };

  const handleConfirmPayment = async () => {
    const studentId = localStorage.getItem("student_id");

    if (!studentId || !selectedCourse) return;

    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      alert("Invalid amount");
      return;
    }

    try {
      setPaymentLoading(true);

      await api.post("/checkout/enroll", {
        student_id: studentId,
        course_id: selectedCourse.id,
        amount,
        payment_date: new Date()
          .toISOString()
          .split("T")[0],
      });

      setCourses((prev) =>
        prev.map((c) =>
          c.id === selectedCourse.id
            ? {
                ...c,
                isEnrolled: true,
              }
            : c
        )
      );

      setSelectedCourse(null);
      setPaymentAmount("");
    } catch (err) {
      console.log(err);
      alert("Already Enrolled");
    } finally {
      setPaymentLoading(false);
    }
  };

  const enrolledCourses = courses.filter(
    (c) => c.isEnrolled
  );

  const availableCourses = courses.filter(
    (c) => !c.isEnrolled
  );

  return (
        <div style={containerStyle}>
      <Header loading={loading} total={courses.length} />

      {!loading && (
        <div style={statsContainerStyle}>
          <div style={statsCardStyle}>
            <h2>{courses.length}</h2>
            <p>Total Courses</p>
          </div>

          <div style={statsCardStyle}>
            <h2>{enrolledCourses.length}</h2>
            <p>Enrolled</p>
          </div>

          <div style={statsCardStyle}>
            <h2>{availableCourses.length}</h2>
            <p>Available</p>
          </div>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : courses.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {selectedCourse && (
            <Checkout
              course={selectedCourse}
              paymentAmount={paymentAmount}
              setPaymentAmount={setPaymentAmount}
              onConfirm={handleConfirmPayment}
              onCancel={() => setSelectedCourse(null)}
              loading={paymentLoading}
            />
          )}

          <SectionTitle
            title="🎓 My Courses"
            count={enrolledCourses.length}
          />

          {enrolledCourses.length > 0 ? (
            <CourseGrid>
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled
                  navigate={navigate}
                />
              ))}
            </CourseGrid>
          ) : (
            <EmptyBox text="You haven't enrolled in any course yet." />
          )}

          <SectionTitle
            title="📚 Available Courses"
            count={availableCourses.length}
          />

          {availableCourses.length > 0 ? (
            <CourseGrid>
              {availableCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={() => handleStartCheckout(course)}
                  navigate={navigate}
                />
              ))}
            </CourseGrid>
          ) : (
            <EmptyBox text="No more courses available." />
          )}
        </>
      )}
    </div>
  );
}
/* =======================
      UI COMPONENTS
==========================*/

function Header({ loading, total }) {
  return (
    <div style={headerStyle}>
      <h1
        style={{
          margin: 0,
          fontSize: 32,
          fontWeight: "bold",
        }}
      >
        📚 Student Courses
      </h1>

      <p
        style={{
          marginTop: 10,
          opacity: 0.9,
          fontSize: 16,
        }}
      >
        {loading ? "Loading..." : `${total} Courses Available`}
      </p>
    </div>
  );
}

function Loading() {
  return (
    <div style={loadingStyle}>
      <h2>Loading Courses...</h2>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={emptyStyle}>
      <h2>No Courses Found</h2>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div style={emptyStyle}>
      <h3>{text}</h3>
    </div>
  );
}

function Checkout({
  course,
  paymentAmount,
  setPaymentAmount,
  onConfirm,
  onCancel,
  loading,
}) {
  return (
    <div style={checkoutCardStyle}>
      <h2>💳 Checkout</h2>

      <h3>{course.title}</h3>
<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: 10,
    margin: "12px 0",
  }}
>
  <span
    style={{
      background: "#DBEAFE",
      color: "#2563eb",
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: 13,
      fontWeight: "bold",
    }}
  >
    ⭐ Premium
  </span>

  <span
    style={{
      background: "#DCFCE7",
      color: "#15803d",
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: 13,
      fontWeight: "bold",
    }}
  >
    📹 Live
  </span>
</div>
      <p>Course Fee</p>

      <input
        type="number"
        value={paymentAmount}
        onChange={(e) => setPaymentAmount(e.target.value)}
        style={inputStyle}
      />

      <div
        style={{
          display: "flex",
          gap: 15,
          marginTop: 20,
        }}
      >
        <button
          onClick={onConfirm}
          disabled={loading}
          style={primaryButtonStyle}
        >
          {loading ? "Processing..." : "Pay & Enroll"}
        </button>

        <button
          onClick={onCancel}
          style={secondaryButtonStyle}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function CourseGrid({ children }) {
  return (
    <div style={gridStyle}>
      {children}
    </div>
  );
}

function CourseCard({
  course,
  enrolled,
  onEnroll,
  navigate,
}) {
  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-8px)";
        e.currentTarget.style.boxShadow =
          "0 20px 40px rgba(0,0,0,.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0px)";
        e.currentTarget.style.boxShadow =
          "0 10px 25px rgba(0,0,0,.08)";
      }}
    >
      <div
        style={{
          fontSize: 55,
          textAlign: "center",
        }}
      >
        {enrolled ? "🎓" : "📚"}
      </div>

      <h3
        style={{
          textAlign: "center",
          marginTop: 15,
        }}
      >
        {course.title}
      </h3>

      <p
        style={{
          color: "#666",
          textAlign: "center",
        }}
      >
        Course Fee
      </p>

      <h2
        style={{
          textAlign: "center",
          color: "#2563eb",
        }}
      >
        ₹{course.fee}
      </h2>

      <div
        style={{
          marginTop: 20,
        }}
      >
        {enrolled ? (
          <button
            style={{
              ...buttonStyle,
              background:
                "linear-gradient(135deg,#16a34a,#22c55e)",
            }}
            onClick={() =>
              navigate(`/student/class/${course.id}`)
            }
          >
            ▶ Open Class
          </button>
        ) : (
          <button
            style={buttonStyle}
            onClick={onEnroll}
          >
            🚀 Enroll Now
          </button>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ title, count }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "35px 0 20px",
      }}
    >
      <h2>{title}</h2>

      <span
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "8px 18px",
          borderRadius: 25,
          fontWeight: "bold",
        }}
      >
        {count}
      </span>
    </div>
  );
}

/* ==========================
            STYLES
========================== */

const containerStyle = {
  minHeight: "100vh",
  padding: "30px",
  background: "linear-gradient(to bottom,#eef4ff,#f8fbff)",
};

const headerStyle = {
  background: "linear-gradient(135deg,#2563eb,#4f46e5)",
  color: "#fff",
  padding: "35px",
  borderRadius: "20px",
  marginBottom: "30px",
  boxShadow: "0 15px 35px rgba(37,99,235,.25)",
};

const statsContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: "20px",
  marginBottom: "35px",
};

const statsCardStyle = {
  background: "#fff",
  borderRadius: "18px",
  padding: "25px",
  textAlign: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
  gap: "25px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "20px",
  padding: "25px",
  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
  transition: "all .3s ease",
  cursor: "pointer",
};

const checkoutCardStyle = {
  background: "#fff",
  borderRadius: "20px",
  padding: "25px",
  marginBottom: "30px",
  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  outline: "none",
  marginTop: "10px",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  border: "none",
  borderRadius: "12px",
  background: "linear-gradient(135deg,#2563eb,#4f46e5)",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: ".3s",
};

const primaryButtonStyle = {
  flex: 1,
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "linear-gradient(135deg,#16a34a,#22c55e)",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const loadingStyle = {
  background: "#fff",
  padding: "50px",
  borderRadius: "20px",
  textAlign: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
};

const emptyStyle = {
  background: "#fff",
  padding: "50px",
  borderRadius: "20px",
  textAlign: "center",
  color: "#666",
  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
};