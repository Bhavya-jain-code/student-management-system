import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/profile";

// PAGES
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import EditStudentProfile from "./pages/EditStudentProfile";
import ChangePassword from "./pages/ChangePassword";

// ADMIN
import DashboardPage from "./pages/DashboardPage";
import QueuePage from "./pages/QueuePage";
import StudentListPage from "./pages/StudentListPage";
import CourseListPage from "./pages/CourseListPage";
import ReportsPage from "./pages/ReportsPage";
import AttendancePage from "./pages/AttendancePage";
import MarksPage from "./pages/MarksPage";
import ClassesPage from "./pages/ClassesPage";
import AddClass from "./pages/AddClass";
import EditClass from "./pages/EditClass";
import EditCourse from "./pages/EditCourse";
import AddMarksPage from "./pages/AddMarksPage";
import AddAttendancePage from "./pages/AddAttendancePage";
import AddCoursePage from "./pages/AddCoursePage";
import AddStudentPage from "./pages/AddStudentPage";
import PaymentPage from "./pages/PaymentPage";
import AddPaymentPage from "./pages/AddPaymentPage";
import EnrollmentPage from "./pages/EnrollmentPage";
import EnrollStudentPage from "./pages/EnrollStudentPage";

// STUDENT
import StudentDashboard from "./pages/student/StudentDashboard";
import MyCoursesPage from "./pages/student/MyCoursesPage";
import MyAttendancePage from "./pages/student/MyAttendancePage";
import MyMarksPage from "./pages/student/MyMarksPage";
import MyPaymentsPage from "./pages/student/MyPaymentsPage";
import EditStudentPage from "./pages/student/EditStudentPage";
import MyClassesPage from "./pages/student/MyClassesPage";
import StudentAdvisorChat from "./pages/student/StudentAdvisorChat";
import CollectInstallmentPage from "./pages/CollectInstallmentPage";

// LAYOUTS
import AdminLayout from "./pages/Layouts/AdminLayout";
import StudentLayout from "./pages/Layouts/StudentLayout";

/* ✅ WRAPPER (DEBUG + PROFILE) */
function StudentProfileWrapper() {
  return (
    <div>
      <h1 style={{ color: "green", padding: "10px" }}>
        Profile Page Loaded
      </h1>

      <StudentProfilePage />
    </div>
  );
}

function App() {
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔥 PROFILE PAGE (MERGED FIX) */}
        <Route
          path="/students/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <StudentProfileWrapper />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
         <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />


        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/student/profile" element={<StudentProfilePage />} />
         <Route path="/edit-profile" element={<EditStudentProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />


        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <StudentListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
       <Route
  path="/admin/edit-class/:id"
  element={
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <EditClass />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
<Route path="/admin/courses/edit/:id" element={<EditCourse />} />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <CourseListPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      <Route
  path="/collect-installments"
  element={
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <CollectInstallmentPage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <ClassesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <ReportsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/queue"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <QueuePage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ADD PAGES */}
        <Route path="/admin/add-class" element={<AddClass />} />

        <Route
          path="/pages/addcourse"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AddCoursePage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/addStudent"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AddStudentPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/payment"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <PaymentPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/AddPayment"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <AddPaymentPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/Enrollments"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <EnrollmentPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pages/EnrollStudent"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <EnrollStudentPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
  path="/pages/add-attendance"
  element={
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <AddAttendancePage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
       <Route
  path="/pages/attendance"
  element={
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <AttendancePage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
        <Route
  path="/pages/add-marks"
  element={
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <AddMarksPage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
        <Route
  path="/pages/marks"
  element={
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminLayout>
        <MarksPage />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

        {/* STUDENT */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["Student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<MyCoursesPage />} />
          <Route path="attendance" element={<MyAttendancePage />} />
          <Route path="marks" element={<MyMarksPage />} />
          <Route path="advisor" element={<StudentAdvisorChat />} />
           <Route path="class/:id" element={<MyClassesPage />} />
        <Route path="payments" element={<MyPaymentsPage />} />
        </Route>

       

        <Route



          path="/student/edit-student/:id"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <EditStudentPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route
          path="/"
          element={
            role === "Admin"
              ? <Navigate to="/admin" />
              : role === "Student"
              ? <Navigate to="/student" />
              : <Navigate to="/register" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;