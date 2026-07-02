const queue = [];

export function enqueue(data) {
  queue.push(data);
}

export function dequeue() {
  if (queue.length === 0) return null;
  return queue.shift();
}

export function getQueue() {
  return queue;
}
