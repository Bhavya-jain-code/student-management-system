import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const addMarks = async (data) => {
  const response = await axios.post(`${BASE_URL}/marks`, data);
  return response.data;
};

export const getMarks = async () => {
  const response = await axios.get(`${BASE_URL}/marks`);
  return response.data;
};

export const deleteMarks = async (id) => {
  const response = await axios.delete(`${BASE_URL}/marks/${id}`);
  return response.data;
};
