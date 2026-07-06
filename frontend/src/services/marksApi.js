import api from "./axiosInstance";

// ===========================
// Add Single Marks
// ===========================
export const addMarks = async (data) => {
  const res = await api.post("/marks", data);
  return res.data;
};

// ===========================
// Bulk Marks
// ===========================
export const bulkMarks = async (data) => {
  const res = await api.post("/marks/bulk", data);
  return res.data;
};

// ===========================
// Get All Marks
// ===========================
export const getMarks = async () => {
  const res = await api.get("/marks");
  return res.data;
};

// ===========================
// Delete Marks
// ===========================
export const deleteMarks = async (id) => {
  const res = await api.delete(`/marks/${id}`);
  return res.data;
};

// ===========================
// Get Students By Course
// ===========================
export const getStudentsByCourse = async (courseId) => {
  const res = await api.get(`/courses/${courseId}/students`);
  return res.data;
};
