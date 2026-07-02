import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function AdminLayout({ children }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* Navbar */}
      <div className="h-16 shrink-0">
        <Navbar />
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}

export default AdminLayout;