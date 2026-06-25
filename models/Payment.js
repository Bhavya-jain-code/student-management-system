class Payment {
  constructor(id, studentId, courseId, amount) {
    this.id = id;
    this.studentId = studentId;
    this.courseId = courseId;
    this.amount = amount;

    this.status = "pending";
    this.paymentDate = null;
  }

  markAsPaid() {
    this.status = "paid";
    this.paymentDate = new Date();
  }

  markAsFailed() {
    this.status = "failed";
  }
}

export default Payment;
