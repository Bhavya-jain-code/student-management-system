import api from "./axiosInstance";

// REGISTER
export const registerUser = async (userData) => {
  const response = await api.post("/register", userData);
  return response.data;
};

// LOGIN
export const loginUser = async (email, password) => {
  const response = await api.post("/login", {
    email,
    password,
  });

  return response.data;
};
