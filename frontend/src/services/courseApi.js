import api from "./axiosInstance";

// Get all courses
export const getCourses = async () => {
  const res = await api.get("/courses");
  return res.data;
};

// Add course
export const addCourse = async (data) => {
  const res = await api.post("/courses", data);
  return res.data;
};

// Delete course
export const deleteCourse = async (id) => {
  const res = await api.put(`/courses/delete/${id}`);
  return res.data;
};

// Get single course
export const getCourseById = async (id) => {
  const res = await api.get(`/courses/${id}`);
  return res.data;
};

// Update course
export const updateCourse = async (id, data) => {
  const res = await api.put(`/courses/${id}`, data);
  return res.data;
};

// Update only the course status
export const updateCourseStatus = async (id, status) => {
  return updateCourse(id, { status });
};
