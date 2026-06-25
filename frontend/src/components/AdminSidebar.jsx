import { Link } from "react-router-dom";

function AdminSidebar() {
  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-5">Admin Panel</h2>

      <ul className="space-y-3">
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/students">Students</Link></li>
        <li><Link to="/admin/courses">Courses</Link></li>
        <li><Link to="/admin/reports">Reports</Link></li>
      </ul>
    </div>
  );
}

export default AdminSidebar;