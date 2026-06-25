import { useEffect, useState } from "react";
import api from "../../services/axiosInstance";

function MyPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const studentId = localStorage.getItem("student_id");

        if (!studentId) {
          setPayments([]);
          setLoading(false);
          return;
        }

        const res = await api.get(
          `/student/${studentId}/payments`
        );

        setPayments(res.data || []);
      } catch (err) {
        console.error(err);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const totalPaid = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div style={container}>
      {/* HEADER */}
      <div style={header}>
        <h1>💳 My Payments</h1>
        <p>Track all your transactions in real time</p>
      </div>

      {/* STATS */}
      <div style={statsGrid}>
        <div style={statCard}>
          <h3>Total Transactions</h3>
          <h1>{payments.length}</h1>
        </div>

        <div style={statCard}>
          <h3>Total Paid</h3>
          <h1>₹{totalPaid}</h1>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={loadingBox}>Loading payments...</div>
      )}

      {/* EMPTY */}
      {!loading && payments.length === 0 && (
        <div style={emptyBox}>
          No payment records found
        </div>
      )}

      {/* DYNAMIC CARDS */}
      {!loading && payments.length > 0 && (
        <div style={grid}>
          {payments.map((p) => (
            <div key={p.id} style={card}>
              <div style={cardHeader}>
                <h3>{p.course_name}</h3>

                <span
                  style={{
                    ...statusBadge,
                    background:
                      p.status === "Paid"
                        ? "#22c55e"
                        : "#ef4444",
                  }}
                >
                  {p.status}
                </span>
              </div>

              <div style={infoRow}>
                <span>💰 Amount</span>
                <strong>₹{p.amount}</strong>
              </div>

              <div style={infoRow}>
                <span>📅 Date</span>
                <strong>
                  {p.payment_date
                    ? new Date(
                        p.payment_date
                      ).toLocaleDateString()
                    : "-"}
                </strong>
              </div>

              <div style={progressBar}>
                <div
                  style={{
                    ...progressFill,
                    width:
                      p.status === "Paid"
                        ? "100%"
                        : "40%",
                    background:
                      p.status === "Paid"
                        ? "#22c55e"
                        : "#ef4444",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPaymentsPage;

/* ================= STYLES ================= */

const container = {
  padding: "30px",
  background: "#f4f7fc",
  minHeight: "100vh",
};

const header = {
  background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
  color: "white",
  padding: "25px",
  borderRadius: "18px",
  marginBottom: "25px",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "15px",
  marginBottom: "25px",
};

const statCard = {
  background: "white",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
  gap: "20px",
};

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "18px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  transition: "0.3s",
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
};

const statusBadge = {
  padding: "5px 12px",
  borderRadius: "20px",
  color: "white",
  fontSize: "12px",
};

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
  color: "#6b7280",
};

const progressBar = {
  height: "6px",
  background: "#e5e7eb",
  borderRadius: "10px",
  marginTop: "12px",
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  borderRadius: "10px",
};

const loadingBox = {
  textAlign: "center",
  padding: "30px",
};

const emptyBox = {
  textAlign: "center",
  padding: "40px",
  background: "white",
  borderRadius: "15px",
};