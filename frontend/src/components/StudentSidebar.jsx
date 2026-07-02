import { Link, useLocation } from "react-router-dom";

function StudentSidebar() {
  const location = useLocation();

  const menus = [
    { title: "Dashboard", path: "/student", icon: "🏠" },
    { title: "My Courses", path: "/student/courses", icon: "📚" },
   
    { title: "Attendance", path: "/student/attendance", icon: "📊" },
    { title: "Marks", path: "/student/marks", icon: "📝" },
    { title: "Payments", path: "/student/payments", icon: "💳" },
    { title: "Advisor", path: "/student/advisor", icon: "👨‍🏫" },
  ];

  return (
    <aside
      className="fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-blue-900 text-white overflow-y-auto shadow-lg"
    >
      <div className="p-5 text-center border-b border-blue-700">
        <h2 className="text-xl font-bold">Student Panel</h2>
      </div>

      <div className="p-3">
        {menus.map((menu) => {
          const active =
            location.pathname === menu.path ||
            (menu.path !== "/student" &&
              location.pathname.startsWith(menu.path));

          return (
            <Link
              key={menu.path}
              to={menu.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                active
                  ? "bg-blue-600"
                  : "hover:bg-blue-700"
              }`}
            >
              <span>{menu.icon}</span>
              <span>{menu.title}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export default StudentSidebar;