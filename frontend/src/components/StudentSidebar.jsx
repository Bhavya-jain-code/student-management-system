import { Link } from "react-router-dom";

function StudentSidebar() {
  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "#1e40af",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <h2>🎓 Student Menu</h2>

      <Link style={linkStyle} to="/student">
        Dashboard
      </Link>

      <Link style={linkStyle} to="/student/courses">
        📚 My Courses
      </Link>
      <Link  style={linkStyle}
  to="/student/classes"

>
  📚 My Classes
</Link>

      <Link style={linkStyle} to="/student/attendance">
        📊 Attendance
      </Link>

      <Link style={linkStyle} to="/student/marks">
        📝 Marks
      </Link>


  <Link  style={linkStyle} to="/student/payments">
    💳 Payments
  </Link>

      
    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "10px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.1)",
};

export default StudentSidebar;