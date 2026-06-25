let emailSet = new Set();

function addEmail(email) {
  if (emailSet.has(email)) {
    return "Duplicate email";
  }

  emailSet.add(email);
  return "Added";
}

module.exports = { addEmail };
