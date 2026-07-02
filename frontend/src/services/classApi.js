import api from "./axiosInstance";

// Get all classes
export const getClasses = async () => {
  const res = await api.get("/classes");
  return res.data;
};

// Get classes by course
export const getCourseClasses = async (courseId) => {
  const res = await api.get(`/courses/${courseId}/classes`);
  return res.data;
};

// Create class
export const addClass = async (data) => {
  const res = await api.post("/classes", data);
  return res.data;
};

// Update class
export const updateClass = async (id, data) => {
  const res = await api.put(`/classes/${id}`, data);
  return res.data;
};

// Delete class
export const deleteClass = async (id) => {
  const res = await api.delete(`/classes/${id}`);
  return res.data;
};

// Get single class
export const getClassById = async (id) => {
  const res = await api.get(`/classes/${id}`);
  return res.data;
};
