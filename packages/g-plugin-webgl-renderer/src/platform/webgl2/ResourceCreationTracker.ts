import type { Resource } from '../interfaces';

export class ResourceCreationTracker {
  liveObjects = new Set<Resource>();
  creationStacks = new Map<Resource, string>();
  deletionStacks = new Map<Resource, string>();

  trackResourceCreated(o: Resource): void {
    this.creationStacks.set(o, new Error().stack!);
    this.liveObjects.add(o);
  }

  trackResourceDestroyed(o: Resource): void {
    if (this.deletionStacks.has(o))
      console.warn(
        `Object double freed:`,
        o,
        `\n\nCreation stack: `,
        this.creationStacks.get(o),
        `\n\nDeletion stack: `,
        this.deletionStacks.get(o),
        `\n\nThis stack: `,
        new Error().stack!,
      );
    this.deletionStacks.set(o, new Error().stack!);
    this.liveObjects.delete(o);
  }

  checkForLeaks(): void {
    for (const o of this.liveObjects.values())
      console.warn('Object leaked:', o, 'Creation stack:', this.creationStacks.get(o));
  }

  setResourceLeakCheck(o: Resource, v: boolean): void {
    if (v) {
      this.liveObjects.add(o);
    } else {
      this.liveObjects.delete(o);
    }
  }
}
