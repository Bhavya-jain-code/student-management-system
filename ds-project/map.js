let studentMap = new Map();

function addToMap(student) {
  studentMap.set(student.id, student);
}

function getFromMap(id) {
  return studentMap.get(id);
}

function deleteFromMap(id) {
  studentMap.delete(id);
}

module.exports = { addToMap, getFromMap, deleteFromMap };
