import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// ADMIN
import DashboardPage from "./pages/DashboardPage";
import StudentListPage from "./pages//StudentListPage";
import CourseListPage from "./pages//CourseListPage";
import ReportsPage from "./pages//ReportsPage";
import AttendancePage from "./pages/AttendancePage";
import MarksPage from "./pages/MarksPage";
import ClassesPage from "./pages/ClassesPage";
import AddClass from "./pages/AddClass";



import AddMarksPage from "./pages/AddMarksPage";
import AddAttendancePage from "./pages/AddAttendancePage";
import AddCoursePage from "./pages//AddCoursePage";
import AddStudentPage from "./pages//AddStudentPage";
import PaymentPage from "./pages//PaymentPage";
import AddPaymentPage from "./pages//AddPaymentPage";


import EnrollmentPage from "./pages//EnrollmentPage";
import EnrollStudentPage from "./pages//EnrollStudentPage";

// STUDENT
import StudentDashboard from "./pages/student/StudentDashboard";
import MyCoursesPage from "./pages/student/MyCoursesPage";
import MyAttendancePage from "./pages/student/MyAttendancePage";
import MyMarksPage from "./pages/student/MyMarksPage";
import MyPaymentsPage from "./pages/student/MyPaymentsPage";
import EditStudentPage from "./pages/student/EditStudentPage";
import MyClassesPage from "./pages/student/MyClassesPage";
import StudentAdvisorChat from "./pages/student/StudentAdvisorChat";
// LAYOUTS
import AdminLayout from "./pages/Layouts/AdminLayout";
import StudentLayout from "./pages/Layouts/StudentLayout";

function App() {
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
  path="/register"
  element={<RegisterPage />}
/>
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
          path="/students"
          element={<Navigate to="/admin/students" replace />}
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
<Route path="/admin/add-class" element={<AddClass />} />

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
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout>
                <ReportsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />


        <Route path="/pages/add-attendance" element={<AddAttendancePage />} />
<Route path="/pages/attendance" element={<AttendancePage />} />

<Route path="/pages/add-marks" element={<AddMarksPage />} />
<Route path="/pages/marks" element={<MarksPage />} />



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
  <Route path="/student/marks" element={<MyMarksPage />} />
   <Route path="/student/advisor" element={<StudentAdvisorChat />} />
</Route>
<Route
  path="/student/classes"
  element={<MyClassesPage />}
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
        <Route
  path="student/payments"
  element={<MyPaymentsPage />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;