import { SyncHook, SyncWaterfallHook, AsyncParallelHook, AsyncSeriesWaterfallHook } from '../../../packages/g-lite/src/utils/tapable';

describe('Tapable', () => {
  describe('SyncHook', () => {
    it('should call all registered callbacks', () => {
      const hook = new SyncHook<[string]>();
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      hook.tap('callback1', callback1);
      hook.tap('callback2', callback2);

      hook.call('test');

      expect(callback1).toHaveBeenCalledWith('test');
      expect(callback2).toHaveBeenCalledWith('test');
    });

    it('should call callbacks with multiple arguments', () => {
      const hook = new SyncHook<[string, number]>();
      const callback = jest.fn();

      hook.tap('test', callback);
      hook.call('hello', 42);

      expect(callback).toHaveBeenCalledWith('hello', 42);
    });
  });

  describe('SyncWaterfallHook', () => {
    it('should pass result from one callback to the next', () => {
      const hook = new SyncWaterfallHook<[string], string>();
      const callback1 = jest.fn((str) => str + ' world');
      const callback2 = jest.fn((str) => str + '!');

      hook.tap('callback1', callback1);
      hook.tap('callback2', callback2);

      const result = hook.call('hello');

      expect(callback1).toHaveBeenCalledWith('hello');
      expect(callback2).toHaveBeenCalledWith('hello world');
      expect(result).toBe('hello world!');
    });

    it('should return null when no callbacks are registered', () => {
      const hook = new SyncWaterfallHook<[string], string>();
      const result = hook.call('test');
      expect(result).toBeNull();
    });
  });

  describe('AsyncParallelHook', () => {
    it('should call all registered async callbacks in parallel', async () => {
      const hook = new AsyncParallelHook<string>();
      const callback1 = jest.fn().mockResolvedValue(undefined);
      const callback2 = jest.fn().mockResolvedValue(undefined);

      hook.tapPromise('callback1', callback1);
      hook.tapPromise('callback2', callback2);

      await hook.promise('test');

      expect(callback1).toHaveBeenCalledWith('test');
      expect(callback2).toHaveBeenCalledWith('test');
    });

    it('should return array of results from all callbacks', async () => {
      const hook = new AsyncParallelHook<string>();
      
      hook.tapPromise('test1', async (arg) => {
        return `result1-${arg}`;
      });
      
      hook.tapPromise('test2', async (arg) => {
        return `result2-${arg}`;
      });

      const results = await hook.promise('test');
      
      expect(results).toEqual([
        'result1-test',
        'result2-test'
      ]);
    });
  });

  describe('AsyncSeriesWaterfallHook', () => {
    it('should call async callbacks in series and pass result from one to the next', async () => {
      const hook = new AsyncSeriesWaterfallHook<[string], string>();
      const callback1 = jest.fn(async (str) => str + ' world');
      const callback2 = jest.fn(async (str) => str + '!');

      hook.tapPromise('callback1', callback1);
      hook.tapPromise('callback2', callback2);

      const result = await hook.promise('hello');

      expect(callback1).toHaveBeenCalledWith('hello');
      expect(callback2).toHaveBeenCalledWith('hello world');
      expect(result).toBe('hello world!');
    });

    it('should return null when no callbacks are registered', async () => {
      const hook = new AsyncSeriesWaterfallHook<[string], string>();
      const result = await hook.promise('test');
      expect(result).toBeNull();
    });
  });
});