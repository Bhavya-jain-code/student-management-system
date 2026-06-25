class Enrollment {
  constructor(id, studentId, courseId, enrollmentDate) {
    this.id = id;
    this.studentId = studentId;
    this.courseId = courseId;
    this.enrollmentDate = enrollmentDate;

    this.status = "active";
  }

  cancelEnrollment() {
    this.status = "cancelled";
  }

  completeEnrollment() {
    this.status = "completed";
  }
}

export default Enrollment;
