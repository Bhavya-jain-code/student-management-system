import axios from "axios";

const BASE_URL = "http://localhost:3000";

// -------------------
// Add Single Attendance
// -------------------
export const addAttendance = async (data) => {
  const response = await axios.post(`${BASE_URL}/attendance`, data);
  return response.data;
};

// -------------------
// Bulk Attendance
// -------------------
export const bulkAttendance = async (data) => {
  const response = await axios.post(`${BASE_URL}/attendance/bulk`, data);

  return response.data;
};

// -------------------
// Get Students By Course
// -------------------
export const getStudentsByCourse = async (courseId) => {
  const response = await axios.get(`${BASE_URL}/courses/${courseId}/students`);

  return response.data;
};

// -------------------
// Get Attendance
// -------------------
export const getAttendance = async () => {
  const response = await axios.get(`${BASE_URL}/attendance`);
  return response.data;
};

// -------------------
// Delete Attendance
// -------------------
export const deleteAttendance = async (id) => {
  const response = await axios.delete(`${BASE_URL}/attendance/${id}`);

  return response.data;
};
