import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

function AdminLayout({ children }) {
  return (
    <>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <div className="flex-1 p-5">
          {children}
        </div>
      </div>
    </>
  );
}

export default AdminLayout;