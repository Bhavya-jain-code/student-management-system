import axios from "axios";

export const getDashboardData = async () => {
  const token = localStorage.getItem("token");

  return await axios.get("http://localhost:3000/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`, // ✅ MUST
    },
  });
};
