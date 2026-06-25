let students = [];

function addStudent(student) {
  students.push(student);
}

function findStudentById(id) {
  for (let i = 0; i < students.length; i++) {
    if (students[i].id === id) {
      return students[i];
    }
  }
  return null;
}

function deleteStudent(id) {
  let updated = [];

  for (let i = 0; i < students.length; i++) {
    if (students[i].id !== id) {
      updated.push(students[i]);
    }
  }

  students = updated;
}

module.exports = { addStudent, findStudentById, deleteStudent };
