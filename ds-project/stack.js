let stack = [];

function push(action) {
  stack.push(action);
}

function pop() {
  return stack.pop();
}

function viewStack() {
  return stack;
}

module.exports = { push, pop, viewStack };
