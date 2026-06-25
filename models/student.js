import user from "user";
import Student from "../models/Student.js";

class Student extends User {
  constructor(id, name, email, phone, address) {
    super(id, name, email);

    this.phone = phone;
    this.address = address;
    this.status = "active";
    this.role = "student";
    this.enrolledCourses = [];
  }

  enrollCourse(courseId) {
    this.enrolledCourses.push(courseId);
  }

  deactivateStudent() {
    this.status = "inactive";
  }

  activateStudent() {
    this.status = "active";
  }

  getDashboard() {
    return "Student Dashboard";
  }

  getStudentInfo() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      status: this.status,
      enrolledCourses: this.enrolledCourses,
    };
  }
}

export default Student;
