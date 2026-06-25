import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StudentSidebar from "../../components/StudentSidebar";

function StudentLayout() {
  return (
    <>
      <Navbar />
      <div style={{ display: "flex" }}>
        <StudentSidebar />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default StudentLayout;