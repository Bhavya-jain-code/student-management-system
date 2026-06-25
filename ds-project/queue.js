let queue = [];

function enqueue(student) {
  queue.push(student);
}

function dequeue() {
  return queue.shift();
}

function viewQueue() {
  return queue;
}

module.exports = { enqueue, dequeue, viewQueue };
