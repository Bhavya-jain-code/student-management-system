import axios from "axios";

const BASE_URL = "http://localhost:3000";

// Get all courses
export const getCourses = async () => {
  const res = await axios.get(`${BASE_URL}/courses`);
  return res.data;
};
// Add course
export const addCourse = async (data) => {
  const res = await axios.post(`${BASE_URL}/courses`, data);
  return res.data;
};

// Delete course
export const deleteCourse = async (id) => {
  const res = await axios.delete(`${BASE_URL}/courses/${id}`);
  return res.data;
};

// Get single course
export const getCourseById = async (id) => {
  const res = await axios.get(`${BASE_URL}/courses/${id}`);
  return res.data;
};

// Update course
export const updateCourse = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/courses/${id}`, data);
  return res.data;
};
