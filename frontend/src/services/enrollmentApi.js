import api from "./axiosInstance";

export const enrollStudent = async (data) => {
  const res = await api.post("/EnrollStudent", data);
  return res.data;
};

export const getStudentCourses = async (studentId) => {
  const res = await api.get(`/student/${studentId}/courses`);
  return res.data;
};

export const getStudentEnrollments = async (studentId) => {
  const res = await api.get(`/student/${studentId}/enrollments`);
  return res.data;
};

export const getEnrollments = async () => {
  const res = await api.get("/enrollments");
  return res.data;
};
