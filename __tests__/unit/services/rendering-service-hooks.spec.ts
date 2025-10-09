import { Canvas, IRenderer } from '@antv/g';
import { Renderer as SVGRenderer } from '@antv/g-svg';

describe('RenderingService Hooks', () => {
  let canvas: Canvas;
  let renderer: IRenderer;

  beforeEach(async () => {
    renderer = new SVGRenderer();
    
    const $container = document.createElement('div');
    $container.id = 'container';
    document.body.appendChild($container);
    
    canvas = new Canvas({
      container: 'container',
      width: 100,
      height: 100,
      renderer,
    });
    
    // Wait for Canvas initialization to complete
    if (canvas.ready) {
      await canvas.ready;
    }
  });

  afterEach(() => {
    if (canvas) {
      canvas.destroy();
    }
    
    // Clean up DOM
    const $container = document.getElementById('container');
    if ($container) {
      $container.remove();
    }
  });

  it('should register init hooks correctly', () => {
    const renderingService = canvas.getRenderingService();
    
    // Test init hook registration
    const initCallback = jest.fn();
    renderingService.hooks.init.tap('TestInit', initCallback);
    
    // Verify the hook is registered by calling it directly
    renderingService.hooks.init.call();
    expect(initCallback).toHaveBeenCalled();
  });

  it('should call render related hooks during rendering', (done) => {
    const renderingService = canvas.getRenderingService();
    
    // Test render related hooks
    const beginFrameCallback = jest.fn();
    const endFrameCallback = jest.fn();
    
    renderingService.hooks.beginFrame.tap('TestBeginFrame', beginFrameCallback);
    renderingService.hooks.endFrame.tap('TestEndFrame', endFrameCallback);
    
    // Trigger rendering
    canvas.render();
    
    // Use setTimeout to ensure async operations are completed
    setTimeout(() => {
      try {
        // Verify hooks were called
        expect(beginFrameCallback).toHaveBeenCalled();
        expect(endFrameCallback).toHaveBeenCalled();
        done();
      } catch (error) {
        done(error);
      }
    }, 100);
  });

  it('should call pointer event hooks', () => {
    const renderingService = canvas.getRenderingService();
    
    // Test pointer event hooks
    const pointerDownCallback = jest.fn();
    const pointerUpCallback = jest.fn();
    const pointerMoveCallback = jest.fn();
    
    renderingService.hooks.pointerDown.tap('TestPointerDown', pointerDownCallback);
    renderingService.hooks.pointerUp.tap('TestPointerUp', pointerUpCallback);
    renderingService.hooks.pointerMove.tap('TestPointerMove', pointerMoveCallback);
    
    // Trigger events with proper event objects
    const mockPointerEvent = {
      clientX: 10, 
      clientY: 10,
      type: 'pointerdown'
    } as any;
    
    renderingService.hooks.pointerDown.call(mockPointerEvent);
    mockPointerEvent.type = 'pointerup';
    renderingService.hooks.pointerUp.call(mockPointerEvent);
    mockPointerEvent.type = 'pointermove';
    renderingService.hooks.pointerMove.call(mockPointerEvent);
    
    // Verify hooks were called
    expect(pointerDownCallback).toHaveBeenCalledWith(mockPointerEvent);
    expect(pointerUpCallback).toHaveBeenCalledWith(mockPointerEvent);
    expect(pointerMoveCallback).toHaveBeenCalledWith(mockPointerEvent);
  });

  it('should call pick hooks', () => {
    const renderingService = canvas.getRenderingService();
    
    // Test pick hooks - test the hook registration and direct call
    const pickCallback = jest.fn((result) => {
      return result;
    });
    
    renderingService.hooks.pickSync.tap('TestPick', pickCallback);
    
    // Create test data that matches the expected PickingResult structure
    const testData = {
      position: { 
        x: 10, 
        y: 10, 
        viewportX: 10, 
        viewportY: 10, 
        clientX: 10, 
        clientY: 10 
      },
      picked: [],
      topmost: true,
    };
    
    // Call the hook directly with test data
    const result = renderingService.hooks.pickSync.call(testData);
    
    // Verify hooks were called with correct data
    expect(pickCallback).toHaveBeenCalled();
    expect(result).toEqual(testData);
  });

  it('should support waterfall hooks', () => {
    const renderingService = canvas.getRenderingService();
    
    // Test waterfall hooks (like dirtycheck) - test the hook registration and direct call
    const dirtyCheckCallback1 = jest.fn((object) => {
      // First callback just passes through the object
      return object;
    });
    
    const dirtyCheckCallback2 = jest.fn((object) => {
      // Second callback also passes through the object
      return object;
    });
    
    renderingService.hooks.dirtycheck.tap('TestDirtyCheck1', dirtyCheckCallback1);
    renderingService.hooks.dirtycheck.tap('TestDirtyCheck2', dirtyCheckCallback2);
    
    // Call the hook directly with test data
    const testData = null;
    const result = renderingService.hooks.dirtycheck.call(testData);
    
    // Verify all callbacks were called in the correct order
    expect(dirtyCheckCallback1).toHaveBeenCalled();
    expect(dirtyCheckCallback2).toHaveBeenCalled();
    expect(result).toBe(testData); // Waterfall should pass through the final result
  });
});