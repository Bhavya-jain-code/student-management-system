import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const addAttendance = async (data) => {
  const response = await axios.post(`${BASE_URL}/attendance`, data);
  return response.data;
};

export const getAttendance = async () => {
  const response = await axios.get(`${BASE_URL}/attendance`);
  return response.data;
};

export const deleteAttendance = async (id) => {
  const response = await axios.delete(`${BASE_URL}/attendance/${id}`);
  return response.data;
};
