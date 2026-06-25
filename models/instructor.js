import user from "user";

class Instructor extends User {
  constructor(id, name, email, expertise) {
    super(id, name, email);

    this.expertise = expertise;
    this.role = "instructor";
  }

  getDashboard() {
    return "Instructor Dashboard";
  }
}

export default Instructor;
