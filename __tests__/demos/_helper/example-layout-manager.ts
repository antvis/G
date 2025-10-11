/**
 * Layout manager for arranging examples in a grid
 */
export class ExampleLayoutManager {
  private regionWidth: number;
  private regionHeight: number;
  private padding: number;
  private columns: number;
  private currentIndex: number;

  constructor(
    regionWidth: number = 200,
    regionHeight: number = 150,
    padding: number = 30,
    columns: number = 3,
  ) {
    this.regionWidth = regionWidth;
    this.regionHeight = regionHeight;
    this.padding = padding;
    this.columns = columns;
    this.currentIndex = 0;
  }

  /**
   * Get the next position for an example
   * @returns Object containing x and y coordinates
   */
  getNextPosition(): { x: number; y: number } {
    const row = Math.floor(this.currentIndex / this.columns);
    const col = this.currentIndex % this.columns;
    this.currentIndex++;

    return {
      x: this.padding + col * (this.regionWidth + this.padding),
      y: this.padding + row * (this.regionHeight + this.padding),
    };
  }

  /**
   * Reset the index to start from the beginning
   */
  reset(): void {
    this.currentIndex = 0;
  }

  /**
   * Get region dimensions
   */
  getRegionDimensions(): { width: number; height: number } {
    return {
      width: this.regionWidth,
      height: this.regionHeight,
    };
  }
}
