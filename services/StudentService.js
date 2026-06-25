import Student from "../models/Student";

class StudentService {
  constructor() {
    this.students = [];
    this.studentMap = new Map();
    this.emailSet = new Set();
  }

  // ➕ ADD STUDENT
  addStudent(name, email, phone, address) {
    if (this.emailSet.has(email)) {
      throw new Error("Email already exists");
    }

    const id = this.students.length + 1;
    const student = new Student(id, name, email, phone, address);

    this.students.push(student);
    this.studentMap.set(id, student);
    this.emailSet.add(email);

    return student;
  }

  // 📋 GET ALL
  getAllStudents() {
    return this.students;
  }

  // 🔍 GET BY ID
  getStudentById(id) {
    return this.studentMap.get(id);
  }

  // ❌ DELETE
  deleteStudent(id) {
    const student = this.studentMap.get(id);

    if (!student) {
      throw new Error("Student not found");
    }

    this.students = this.students.filter((s) => s.id !== id);
    this.studentMap.delete(id);
    this.emailSet.delete(student.email);

    return student;
  }

  // 🔎 SEARCH
  searchByName(name) {
    return this.students.filter((student) =>
      student.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  // 🔃 SORT
  sortByName() {
    return this.students.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export default StudentService;
