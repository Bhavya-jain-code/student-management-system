import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaBook,
  FaClipboardList,
  FaChalkboardTeacher,
  FaMoneyBill,
  FaFileAlt,
  FaCalendarCheck,
  FaClipboard,
  FaVideo,
  FaMoneyBillWave ,
  FaMoneyCheckAlt ,
} from "react-icons/fa";

function Sidebar() {
  const role = localStorage.getItem("role");

  const linkClass = ({ isActive }) =>
    isActive
      ? "flex items-center gap-3 bg-blue-600 text-white px-3 py-1 rounded border-l-4 border-white"
      : "flex items-center gap-3 hover:bg-gray-700 px-3 py-2 rounded transition-all duration-200";

  return (
    <div className="w-60 bg-gray-800 text-white p-4 h-full overflow-y-auto">

      <div className="space-y-1">

        {/* ADMIN */}
        {role === "Admin" && (
          <>
            <NavLink to="/admin" end className={linkClass}>
              <FaTachometerAlt /> Dashboard
            </NavLink>

            <NavLink to="/admin/students" className={linkClass}>
              <FaUserGraduate /> Students
            </NavLink>

            <NavLink to="/admin/courses" className={linkClass}>
              <FaBook /> Courses
            </NavLink>
            <NavLink to="/admin/classes" className={linkClass}>
  <FaVideo /> Classes
</NavLink>

            <NavLink to="/pages/Enrollments" className={linkClass}>
              <FaClipboardList /> Enrollments
            </NavLink>

            <NavLink to="/pages/EnrollStudent" className={linkClass}>
              <FaChalkboardTeacher /> Enroll Student
            </NavLink>
<NavLink to="/collect-installments" className={linkClass}>
  <FaMoneyCheckAlt /> Collect Installments
</NavLink>
            <NavLink to="/pages/payment" className={linkClass}>
              <FaMoneyBill /> Payments
            </NavLink>

            <NavLink to="/pages/add-attendance" className={linkClass}>
              <FaCalendarCheck /> Add Attendance
            </NavLink>

            <NavLink to="/pages/attendance" className={linkClass}>
              <FaClipboard /> Attendance
            </NavLink>

            <NavLink to="/pages/add-marks" className={linkClass}>
              <FaFileAlt /> Add Marks
            </NavLink>

            <NavLink to="/pages/marks" className={linkClass}>
              <FaFileAlt /> Marks
            </NavLink>

            <NavLink to="/admin/reports" className={linkClass}>
              <FaFileAlt /> Reports
            </NavLink>
          </>
        )}

        {/* STUDENT */}
        {role === "Student" && (
          <>
            <NavLink to="/student" className={linkClass}>
              <FaTachometerAlt /> Dashboard
            </NavLink>

            <NavLink to="/student/courses" className={linkClass}>
              <FaBook /> My Courses
            </NavLink>

            <NavLink to="/student/attendance" className={linkClass}>
              <FaCalendarCheck /> Attendance
            </NavLink>

            <NavLink to="/student/marks" className={linkClass}>
              <FaFileAlt /> Marks
            </NavLink>
          </>
        )}

      </div>
    </div>
  );
}

export default Sidebar;