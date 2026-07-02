import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const addPayment = async (data) => {
  const res = await axios.post(`${BASE_URL}/payments`, data);
  return res.data;
};

export const getPayments = async () => {
  const res = await axios.get(`${BASE_URL}/payments`);
  return res.data;
};

export const deletePayment = async (id) => {
  if (!id) {
    throw new Error("No payment id provided");
  }

  const res = await axios.delete(
    `${BASE_URL}/payments/${encodeURIComponent(id)}`,
  );
  return res.data;
};

// FIXED (was API -> BASE_URL)
export const undoPayment = async (id) => {
  const res = await axios.put(`${BASE_URL}/payments/undo/${id}`);
  return res.data;
};
