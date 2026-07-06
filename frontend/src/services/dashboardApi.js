import api from "./axiosInstance";

export const getDashboardData = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};
