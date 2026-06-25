import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const addPayment = async (data) => {
  const response = await axios.post(`${BASE_URL}/payments`, data);
  return response.data;
};

export const getPayments = async () => {
  const response = await axios.get(`${BASE_URL}/payments`);
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await axios.delete(`${BASE_URL}/payments/${id}`);
  return response.data;
};
