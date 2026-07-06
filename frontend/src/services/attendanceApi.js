import api from "./axiosInstance";

// Add Single Attendance
export const addAttendance = async (data) => {
  const response = await api.post("/attendance", data);
  return response.data;
};

// Bulk Attendance
export const bulkAttendance = async (data) => {
  const response = await api.post("/attendance/bulk", data);
  return response.data;
};

// Get Students By Course
export const getStudentsByCourse = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/students`);
  return response.data;
};

// Get Attendance
export const getAttendance = async () => {
  const response = await api.get("/attendance");
  return response.data;
};

// Delete Attendance
export const deleteAttendance = async (id) => {
  const response = await api.delete(`/attendance/${id}`);
  return response.data;
};
