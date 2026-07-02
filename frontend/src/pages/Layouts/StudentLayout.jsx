import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StudentSidebar from "../../components/StudentSidebar";

function StudentLayout() {
  return (
    <>
      <Navbar />

      <div className="flex">
        <StudentSidebar />

        <main className="ml-64 mt-16 flex-1 p-6 bg-gray-100 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export default StudentLayout;