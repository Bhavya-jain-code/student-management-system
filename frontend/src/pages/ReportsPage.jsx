import { useEffect, useState } from "react";
import { getReports } from "../services/reportsApi";


const statCard = {
  background: "white",
  padding: "20px",
  borderRadius: "20px",
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.08)",
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "20px",
  boxShadow:
    "0 4px 15px rgba(0,0,0,0.08)",
};

const itemStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 0",
  borderBottom: "1px solid #eee",
};


function ReportsPage() {
  const [report, setReport] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalAttendance: 0,
    revenue: 0,

    topperName: "-",
    averagePercentage: 0,
    highestPercentage: 0,
    lowestPercentage: 0,

    passedStudents: 0,
    failedStudents: 0,

    pendingPayments: 0,

    presentCount: 0,
    absentCount: 0,
    attendanceRate: 0,

    highestPayment: 0,
    averagePayment: 0,
  });

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const data = await getReports();
      setReport(data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      style={{
        padding: "30px",
        background: "#f4f7fc",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#4f46e5,#7c3aed)",
          color: "white",
          padding: "30px",
          borderRadius: "20px",
          marginBottom: "25px",
        }}
      >
        <h1>📊 Reports & Analytics Dashboard</h1>
        <p>
          Insights about students, courses,
          attendance and revenue
        </p>
      </div>

      {/* DASHBOARD OVERVIEW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div style={statCard}>
          <h3>👨‍🎓 Students</h3>
          <h1>{report.totalStudents}</h1>
        </div>

        <div style={statCard}>
          <h3>📚 Courses</h3>
          <h1>{report.totalCourses}</h1>
        </div>

        <div style={statCard}>
          <h3>📝 Enrollments</h3>
          <h1>{report.totalEnrollments}</h1>
        </div>

        <div style={statCard}>
          <h3>✅ Attendance</h3>
          <h1>{report.totalAttendance}</h1>
        </div>

        <div style={statCard}>
          <h3>💰 Revenue</h3>
          <h1>₹{report.revenue}</h1>
        </div>

        <div style={statCard}>
          <h3>🏆 Topper</h3>
          <h1>{report.topperName}</h1>
        </div>

        <div style={statCard}>
          <h3>📊 Average %</h3>
          <h1>{report.averagePercentage}%</h1>
        </div>

        <div style={statCard}>
          <h3>📈 Highest %</h3>
          <h1>{report.highestPercentage}%</h1>
        </div>

        <div style={statCard}>
          <h3>📉 Lowest %</h3>
          <h1>{report.lowestPercentage}%</h1>
        </div>

        <div style={statCard}>
          <h3>✅ Passed</h3>
          <h1>{report.passedStudents}</h1>
        </div>

        <div style={statCard}>
          <h3>❌ Failed</h3>
          <h1>{report.failedStudents}</h1>
        </div>

        <div style={statCard}>
          <h3>⏳ Pending Fees</h3>
          <h1>{report.pendingPayments}</h1>
        </div>
      </div>

      {/* ANALYTICS SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(350px,1fr))",
          gap: "20px",
        }}
      >
        <div style={cardStyle}>
          <h2>📈 Attendance Analytics</h2>

          <div style={itemStyle}>
            <span>Present Records</span>
            <b>{report.presentCount}</b>
          </div>

          <div style={itemStyle}>
            <span>Absent Records</span>
            <b>{report.absentCount}</b>
          </div>

          <div style={itemStyle}>
            <span>Attendance Rate</span>
            <b>{report.attendanceRate}%</b>
          </div>
        </div>

        <div style={cardStyle}>
          <h2>💰 Payment Analytics</h2>

          <div style={itemStyle}>
            <span>Total Revenue</span>
            <b>₹{report.revenue}</b>
          </div>

          <div style={itemStyle}>
            <span>Highest Payment</span>
            <b>₹{report.highestPayment}</b>
          </div>

          <div style={itemStyle}>
            <span>Average Payment</span>
            <b>₹{report.averagePayment}</b>
          </div>

          <div style={itemStyle}>
            <span>Pending Fees</span>
            <b>{report.pendingPayments}</b>
          </div>
        </div>

        <div style={cardStyle}>
          <h2>🏆 Academic Performance</h2>

          <div style={itemStyle}>
            <span>Topper</span>
            <b>{report.topperName}</b>
          </div>

          <div style={itemStyle}>
            <span>Average %</span>
            <b>{report.averagePercentage}%</b>
          </div>

          <div style={itemStyle}>
            <span>Highest %</span>
            <b>{report.highestPercentage}%</b>
          </div>

          <div style={itemStyle}>
            <span>Lowest %</span>
            <b>{report.lowestPercentage}%</b>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ReportsPage;