type Listener = (...args: any[]) => void;

const listeners: Record<string, Listener[]> = {};

export function on(event: string, cb: Listener) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(cb);
}

export function off(event: string, cb: Listener) {
  const arr = listeners[event];
  if (!arr) return;
  listeners[event] = arr.filter(l => l !== cb);
}

export function emit(event: string, ...args: any[]) {
  const arr = listeners[event];
  if (!arr) return;
  for (const l of arr.slice()) {
    try { l(...args); } catch (e) { /* ignore */ }
  }
}

// Convenience specific events
export function refreshMissions() {
  emit("missions:refresh");
}
