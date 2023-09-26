import type { Device, Buffer } from '@antv/g-device-api';
import {
  BufferUsage,
  BufferFrequencyHint,
  alignNonPowerOfTwo,
  assert,
  assertExists,
} from '@antv/g-device-api';

// This is a very basic linear allocator. We allocate offsets in-order.
export class DynamicUniformBuffer {
  private device: Device;
  private uniformBufferWordAlignment: number;
  private uniformBufferMaxPageWordSize: number;

  /**
   * Word count, 4 bytes per word
   */
  private currentBufferWordSize = -1;
  private currentWordOffset = 0;
  buffer: Buffer | null = null;

  private shadowBufferF32: Float32Array | null = null;
  private shadowBufferU8: Uint8Array | null = null;

  constructor(device: Device) {
    this.device = device;
    const limits = device.queryLimits();
    this.uniformBufferWordAlignment = limits.uniformBufferWordAlignment;
    this.uniformBufferMaxPageWordSize = limits.uniformBufferMaxPageWordSize;
  }

  isSupportedUBO() {
    // UBO not supported in WebGL1
    return this.device.queryVendorInfo().platformString !== 'WebGL1';
  }

  private findPageIndex(wordOffset: number): number {
    return (wordOffset / this.uniformBufferMaxPageWordSize) | 0;
  }

  allocateChunk(wordCount: number): number {
    wordCount = alignNonPowerOfTwo(wordCount, this.uniformBufferWordAlignment);
    assert(wordCount < this.uniformBufferMaxPageWordSize);

    let wordOffset = this.currentWordOffset;

    // If we straddle the page, then put it at the start of the next one.
    if (
      this.findPageIndex(wordOffset) !==
      this.findPageIndex(wordOffset + wordCount - 1)
    )
      wordOffset = alignNonPowerOfTwo(
        wordOffset,
        this.uniformBufferMaxPageWordSize,
      );

    this.currentWordOffset = wordOffset + wordCount;
    this.ensureShadowBuffer(wordOffset, wordCount);

    return wordOffset;
  }

  private ensureShadowBuffer(wordOffset: number, wordCount: number): void {
    if (this.shadowBufferU8 === null || this.shadowBufferF32 === null) {
      const newWordCount = alignNonPowerOfTwo(
        this.currentWordOffset,
        this.uniformBufferMaxPageWordSize,
      );
      this.shadowBufferU8 = new Uint8Array(newWordCount * 4);
      this.shadowBufferF32 = new Float32Array(this.shadowBufferU8.buffer);
    } else if (wordOffset + wordCount >= this.shadowBufferF32.length) {
      assert(
        wordOffset < this.currentWordOffset &&
          wordOffset + wordCount <= this.currentWordOffset,
      );

      // Grow logarithmically, aligned to page size.
      const newWordCount = alignNonPowerOfTwo(
        Math.max(this.currentWordOffset, this.shadowBufferF32.length * 2),
        this.uniformBufferMaxPageWordSize,
      );
      const newBuffer = new Uint8Array(newWordCount * 4);

      newBuffer.set(this.shadowBufferU8, 0);
      this.shadowBufferU8 = newBuffer;
      this.shadowBufferF32 = new Float32Array(this.shadowBufferU8.buffer);

      if (!(this.currentWordOffset <= newWordCount))
        throw new Error(
          `Assert fail: this.currentWordOffset [${this.currentWordOffset}] <= newWordCount [${newWordCount}]`,
        );
    }
  }

  /**
   * Return the CPU data buffer used internally. Fill this in to submit data to the CPU. Write to
   * it with the offset that was returned from {@see allocateChunk}.
   */
  mapBufferF32(): Float32Array {
    return assertExists(this.shadowBufferF32);
  }

  prepareToRender(): void {
    if (this.shadowBufferF32 === null) {
      return;
    }

    const shadowBufferF32 = assertExists(this.shadowBufferF32);

    if (shadowBufferF32.length !== this.currentBufferWordSize) {
      this.currentBufferWordSize = shadowBufferF32.length;

      if (this.buffer !== null) {
        this.buffer.destroy();
      }

      this.buffer = this.device.createBuffer({
        // in bytes length
        viewOrSize: this.currentBufferWordSize * 4,
        usage: BufferUsage.UNIFORM,
        hint: BufferFrequencyHint.DYNAMIC,
      });
    }

    const wordCount = alignNonPowerOfTwo(
      this.currentWordOffset,
      this.uniformBufferMaxPageWordSize,
    );
    if (!(wordCount <= this.currentBufferWordSize))
      throw new Error(
        `Assert fail: wordCount [${wordCount}] (${this.currentWordOffset} aligned ${this.uniformBufferMaxPageWordSize}) <= this.currentBufferWordSize [${this.currentBufferWordSize}]`,
      );

    if (this.isSupportedUBO()) {
      const buffer = assertExists(this.buffer);
      buffer.setSubData(0, this.shadowBufferU8, 0, wordCount * 4);
    }

    // Reset the offset for next frame.
    this.currentWordOffset = 0;
  }

  destroy(): void {
    if (this.buffer !== null) this.buffer.destroy();

    this.shadowBufferF32 = null;
    this.shadowBufferU8 = null;
  }
}
