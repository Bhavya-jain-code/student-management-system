class Course {
  constructor(id, title, duration, fee, instructor) {
    this.id = id;
    this.title = title;
    this.duration = duration;
    this.fee = fee;
    this.instructor = instructor;

    this.students = [];
    this.status = "active";
  }

  addStudent(studentId) {
    this.students.push(studentId);
  }

  removeStudent(studentId) {
    const updated = [];

    for (let i = 0; i < this.students.length; i++) {
      if (this.students[i] !== studentId) {
        updated.push(this.students[i]);
      }
    }

    this.students = updated;
  }

  getTotalStudents() {
    return this.students.length;
  }
}

export default Course;
