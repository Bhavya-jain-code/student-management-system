class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  login() {
    return `${this.name} logged in successfully`;
  }

  logout() {
    return `${this.name} logged out successfully`;
  }
}

class Student extends User {
  constructor(id, name, email, phone) {
    super(id, name, email);
    this.phone = phone;
    this.role = "student";
  }
}

class Instructor extends User {
  constructor(id, name, email, expertise) {
    super(id, name, email);
    this.expertise = expertise;
    this.role = "instructor";
  }
}
