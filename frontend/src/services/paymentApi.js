import api from "./axiosInstance";

export const addPayment = async (data) => {
  const res = await api.post("/payments", data);
  return res.data;
};

export const getPayments = async () => {
  const res = await api.get("/payments");
  return res.data;
};

export const deletePayment = async (id) => {
  if (!id) {
    throw new Error("No payment id provided");
  }

  const res = await api.delete(`/payments/${encodeURIComponent(id)}`);
  return res.data;
};

export const undoPayment = async (id) => {
  const res = await api.put(`/payments/undo/${id}`);
  return res.data;
};
