import TouchIndicator from './TouchIndicator';

test('draws normalized points, clears released touches, and tolerates queued work after unmount', () => {
  const frames: FrameRequestCallback[] = [];
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    frames.push(callback);
    return frames.length;
  });
  const canvas = document.createElement('canvas');
  const parent = document.createElement('div');
  parent.appendChild(canvas);
  Object.defineProperty(parent, 'offsetWidth', { value: 200 });
  Object.defineProperty(parent, 'offsetHeight', { value: 100 });
  const ctx = {
    canvas,
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
  };
  Object.defineProperty(canvas, 'getContext', { value: jest.fn(() => ctx) });
  const component = new TouchIndicator({
    clientInputs: { local: { one: [500, 250] }, peer: { two: [1000, 1000] } },
  });
  component.setupCanvas(canvas);
  frames.shift()!(0);
  expect(canvas.width).toBe(200);
  expect(canvas.height).toBe(100);
  component.componentDidUpdate();
  expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 200, 100);
  expect(ctx.arc).toHaveBeenCalledWith(100, 25, 36, 0, 2 * Math.PI, false);
  expect(ctx.arc).toHaveBeenCalledWith(200, 100, 36, 0, 2 * Math.PI, false);
  component.props.clientInputs = {};
  ctx.arc.mockClear();
  component.componentDidUpdate();
  expect(ctx.arc).not.toHaveBeenCalled();
  expect(component.shouldComponentUpdate()).toBe(false);
  component.setupCanvas(null);
  expect(() => frames.shift()!(0)).not.toThrow();
});
