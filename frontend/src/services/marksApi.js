import axios from "axios";

const BASE_URL = "http://localhost:3000";

// ===========================
// Add Single Marks
// ===========================
export const addMarks = async (data) => {
  const res = await axios.post(`${BASE_URL}/marks`, data);

  return res.data;
};

// ===========================
// Bulk Marks
// ===========================
export const bulkMarks = async (data) => {
  const res = await axios.post(`${BASE_URL}/marks/bulk`, data);

  return res.data;
};

// ===========================
// Get All Marks
// ===========================
export const getMarks = async () => {
  const res = await axios.get(`${BASE_URL}/marks`);

  return res.data;
};

// ===========================
// Delete Marks
// ===========================
export const deleteMarks = async (id) => {
  const res = await axios.delete(`${BASE_URL}/marks/${id}`);

  return res.data;
};

// ===========================
// Get Students By Course
// ===========================
export const getStudentsByCourse = async (courseId) => {
  const res = await axios.get(`${BASE_URL}/courses/${courseId}/students`);

  return res.data;
};
