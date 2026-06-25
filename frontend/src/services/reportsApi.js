import axios from "axios";

const BASE_URL = "http://localhost:3000";

export const getReports = async () => {
  const response = await axios.get(`${BASE_URL}/reports`);

  return response.data;
};
