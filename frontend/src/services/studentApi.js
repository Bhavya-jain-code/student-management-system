import api from "./axiosInstance";

export const getStudents = async (page = 1) => {
  const res = await api.get(`/students?page=${page}`);
  return res.data;
};

export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`);
  return res.data;
};

export const addStudent = async (data) => {
  const res = await api.post("/students", data);
  return res.data;
};

export const getStudentDashboard = (id) => api.get(`/student-dashboard/${id}`);

export const getStudentCourses = (id) => api.get(`/student/${id}/courses`);

export const getStudentAttendance = (id) =>
  api.get(`/student/${id}/attendance`);

export const getStudentMarks = (id) => api.get(`/student/${id}/marks`);

// NEW
export const getStudentPayments = (id) => api.get(`/student/${id}/payments`);

export const getStudentById = async (id) => {
  return await api.get(`/students/${id}`);
};

export const updateStudent = async (id, data) => {
  return await api.put(`/students/${id}`, data);
};
