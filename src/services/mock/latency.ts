/** Simulated network latency so loading skeletons and spinners are exercised. */
export function delay(min = 150, max = 400): Promise<void> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Minimal event emitter backing the services' subscribe* methods. */
export class Emitter<T> {
  private listeners = new Set<(payload: T) => void>();

  subscribe(cb: (payload: T) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  emit(payload: T): void {
    for (const cb of [...this.listeners]) cb(payload);
  }
}
