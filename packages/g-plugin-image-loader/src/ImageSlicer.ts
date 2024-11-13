const tasks: (() => void)[] = [];
let nextFrameTasks: (() => void)[] = [];

interface API {
  requestAnimationFrame: typeof requestAnimationFrame;
  cancelAnimationFrame: typeof cancelAnimationFrame;
  createCanvas: () => HTMLCanvasElement | OffscreenCanvas;
}

export interface SliceResult {
  tileSize: [number, number];
  /** [rows, cols] */
  gridSize: [number, number];
  /**
   * @example
   * ```
   * [
   *  // tileY=0
   *  [tileX=0, tileX=1, ...],
   *  // tileY=1
   *  [tileX=0, tileX=1, ...],
   * ]
   * ```
   */
  tiles: (null | {
    x: number;
    y: number;
    tileX: number;
    tileY: number;
    data: HTMLCanvasElement | OffscreenCanvas;
  })[][];
}

export class ImageSlicer {
  static api: API;
  static TASK_NUM_PER_FRAME = 10;
  static rafId: ReturnType<typeof requestAnimationFrame>;

  static stop(api = ImageSlicer.api) {
    if (ImageSlicer.rafId) {
      api.cancelAnimationFrame(ImageSlicer.rafId);
      ImageSlicer.rafId = null;
    }
  }

  static executeTask(api = ImageSlicer.api) {
    if (tasks.length <= 0 && nextFrameTasks.length <= 0) {
      return;
    }

    nextFrameTasks.forEach((task) => task());
    nextFrameTasks = tasks.splice(0, ImageSlicer.TASK_NUM_PER_FRAME);

    ImageSlicer.rafId = api.requestAnimationFrame(() => {
      ImageSlicer.executeTask(api);
    });
  }

  static sliceImage(
    image: HTMLImageElement,
    sliceWidth: number,
    sliceHeight: number,
    rerender: () => void,
    overlap = 0,
    api = ImageSlicer.api,
  ) {
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;

    // 计算步长(考虑重叠区域)
    const strideW = sliceWidth - overlap;
    const strideH = sliceHeight - overlap;

    // 计算网格尺寸
    const gridCols = Math.ceil(imageWidth / strideW);
    const gridRows = Math.ceil(imageHeight / strideH);

    const result: SliceResult = {
      tileSize: [sliceWidth, sliceHeight],
      gridSize: [gridRows, gridCols],
      tiles: Array(gridRows)
        .fill(null)
        .map(() => Array(gridCols).fill(null) as SliceResult['tiles'][number]),
    };

    // 遍历网格创建切片
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        tasks.push(() => {
          // 计算当前切片的坐标
          const startX = col * strideW;
          const startY = row * strideH;

          // 处理最后一列/行的特殊情况
          const [tempSliceWidth, tempSliceHeight] = [
            Math.min(sliceWidth, imageWidth - startX),
            Math.min(sliceHeight, imageHeight - startY),
          ];

          // 创建切片canvas
          const sliceCanvas = api.createCanvas();
          sliceCanvas.width = sliceWidth;
          sliceCanvas.height = sliceHeight;
          const sliceCtx = sliceCanvas.getContext('2d');

          // 将图像部分绘制到切片canvas上
          sliceCtx.drawImage(
            image,
            startX,
            startY,
            tempSliceWidth,
            tempSliceHeight,
            0,
            0,
            tempSliceWidth,
            tempSliceHeight,
          );

          // 存储切片信息
          result.tiles[row][col] = {
            x: startX,
            y: startY,
            tileX: col,
            tileY: row,
            data: sliceCanvas,
          };

          rerender();
        });
      }
    }

    ImageSlicer.stop();
    ImageSlicer.executeTask();

    return result;
  }
}
