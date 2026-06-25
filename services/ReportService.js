class ReportService {
  constructor(studentModel, attendanceModel, marksModel) {
    this.studentModel = studentModel;
    this.attendanceModel = attendanceModel;
    this.marksModel = marksModel;
  }

  async generateStudentReport(studentId) {
    const student = await this.getStudentDetails(studentId);
    const attendance = await this.getAttendance(studentId);
    const marks = await this.getMarks(studentId);

    return {
      student,
      attendance,
      marks,
    };
  }

  async getStudentDetails(studentId) {
    const student = await this.studentModel.findById(studentId);

    if (!student) {
      throw new Error("Student not found");
    }

    return {
      id: student.id,
      name: student.name,
      email: student.email,
    };
  }

  async getAttendance(studentId) {
    const attendance = await this.attendanceModel.findByStudentId(studentId);

    const totalClasses = attendance.length;

    const presentCount = attendance.filter(
      (a) => a.status === "present",
    ).length;

    const absentCount = totalClasses - presentCount;

    return {
      totalClasses,
      present: presentCount,
      absent: absentCount,
      percentage: totalClasses ? (presentCount / totalClasses) * 100 : 0,
    };
  }

  async getMarks(studentId) {
    const marks = await this.marksModel.findByStudentId(studentId);

    let total = 0;
    const subjects = {};

    marks.forEach((m) => {
      subjects[m.subject] = m.marks;
      total += m.marks;
    });

    return {
      subjects,
      total,
      average: marks.length ? total / marks.length : 0,
    };
  }
}

module.exports = ReportService;
