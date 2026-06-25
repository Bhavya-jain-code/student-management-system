import StudentService from "./services/StudentService.js";

const studentService = new StudentService();

// Add students
studentService.addStudent("Rahul", "rahul@gmail.com", "9999999999", "Jaipur");
studentService.addStudent("Mohit", "mohit@gmail.com", "8888888888", "Delhi");

// Show all
console.log("ALL STUDENTS:");
console.log(studentService.getAllStudents());

// Get by ID
console.log("BY ID:");
console.log(studentService.getStudentById(1));

// Delete
console.log("DELETE:");
console.log(studentService.deleteStudent(1));

// After delete
console.log("AFTER DELETE:");
console.log(studentService.getAllStudents());
