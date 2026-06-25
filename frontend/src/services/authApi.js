import axios from "axios";

const BASE_URL = "http://localhost:3000";

// REGISTER
export const registerUser = async (userData) => {
  const response = await axios.post(`${BASE_URL}/register`, userData);

  return response.data;
};

// LOGIN
export const loginUser = async (email, password) => {
  const response = await axios.post(`${BASE_URL}/login`, {
    email,
    password,
  });

  return response.data;
};
