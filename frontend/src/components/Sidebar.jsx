import { Link } from "react-router-dom";

function Sidebar() {
  const role = localStorage.getItem("role");

  return (
    <div className="w-60 bg-gray-800 text-white min-h-screen p-4">

      {role === "Admin" && (
        <>
          <Link to="/admin">Dashboard</Link>
          <br /><br />

          <Link to="/admin/students">Students</Link>
          <br /><br />
         
          <Link to="/admin/courses">Courses</Link>
          <br /><br />
          

          

            
            <Link to="/pages/Enrollments">Enrollments</Link>
 <br /><br />
  <Link to="/pages/EnrollStudent">EnrollStudent</Link>
<br /><br />
 <Link to="/admin/classes">Classes</Link>
 <br /><br />
<Link to="/pages/add-attendance">
   Add Attendance
</Link>
 <br /><br />
<Link to="/pages/attendance">
   Attendance Records
</Link>
 <br /><br />
<Link to="/pages/add-marks">
  Add Marks
</Link>
 <br /><br />
<Link to="/pages/marks">
   Marks Records
</Link>







 <br /><br />
  <Link to="/pages/payment">payments</Link>
 <br /><br />
  
  
 

   

          <Link to="/admin/reports">Reports</Link>
        </>
        

      )}

      {role === "Student" && (
        <>
          <Link to="/student">Dashboard</Link>
          <br /><br />

          <Link to="/student/courses">My Courses</Link>
          <br /><br />

          <Link to="/student/attendance">Attendance</Link>
          <br /><br />

          <Link to="/student/marks">Marks</Link>

          
          
        </>
      )}

    </div>
  );
}

export default Sidebar;