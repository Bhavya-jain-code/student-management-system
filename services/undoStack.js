const undoStack = [];

export function pushAction(action) {
  undoStack.push(action);
}

export function popAction() {
  return undoStack.pop();
}

export function getStack() {
  return undoStack;
}
