import { loadAnimation } from '@antv/g-lottie-player';
import * as d3 from 'd3';

export async function assets(context) {
  const { canvas, gui } = context;
  await canvas.ready;

  let pointerAnimation;

  const data1 = await d3.json('/lottie/data1.json');
  const animation1 = loadAnimation(data1, { loop: true, autoplay: true });
  const wrapper1 = animation1.render(canvas);
  wrapper1.scale(0.5);

  // const data2 = await d3.json('/lottie/data4.json');
  // const animation2 = loadAnimation(data2, { loop: true, autoplay: true });
  // const wrapper2 = animation2.render(canvas);
  // wrapper2.scale(0.5);
  // wrapper2.translate(300, 0);

  // const data3 = await d3.json('/lottie/data3.json');
  // const animation3 = loadAnimation(data3, { loop: true, autoplay: true });
  // const wrapper3 = animation3.render(canvas);
  // wrapper3.scale(0.5);
  // wrapper3.translate(300, 200);

  //   const flower = await d3.json('/lottie/flower.json');
  //   const flowerAnimation = loadAnimation(flower, { loop: true, autoplay: true });
  //   const wrapper4 = flowerAnimation.render(canvas);
  //   wrapper4.scale(0.5);
  //   wrapper4.translate(100, 200);

  // const pointer = await d3.json('/lottie/pointer.json');
  // pointerAnimation = loadAnimation(pointer, { loop: false, autoplay: false });
  // const wrapper = pointerAnimation.render(canvas);
  // wrapper.scale(0.5);
  // wrapper.translate(0, 200);

  // console.log(
  //   pointerAnimation.fps(),
  //   pointerAnimation.getDuration(false),
  //   pointerAnimation.getDuration(true),
  // );

  const controlFolder = gui.addFolder('control');
  const controlConfig = {
    pause: () => {
      pointerAnimation.pause();
    },
    play: () => {
      pointerAnimation.play();
    },
    stop: () => {
      pointerAnimation.stop();
    },
    speed: 1,
    goToCurrentTime: 0,
    goToFrame: 0,
    playSegmentsFirstFrame: 0,
    playSegmentsLastFrame: 0,
  };
  controlFolder.add(controlConfig, 'play');
  controlFolder.add(controlConfig, 'pause');
  controlFolder.add(controlConfig, 'stop');
  controlFolder.add(controlConfig, 'speed', -3, 3).onChange((speed) => {
    pointerAnimation.setSpeed(speed);
  });
  controlFolder
    .add(controlConfig, 'goToCurrentTime', 0, 4.04)
    .onChange((time) => {
      pointerAnimation.goTo(time);
      pointerAnimation.play();
    });
  controlFolder.add(controlConfig, 'goToFrame', 0, 101).onChange((frame) => {
    pointerAnimation.goTo(frame, true);
    pointerAnimation.play();
  });
  controlFolder
    .add(controlConfig, 'playSegmentsFirstFrame', 0, 101)
    .onChange((firstFrame) => {
      pointerAnimation.playSegments([
        firstFrame,
        controlConfig.playSegmentsLastFrame,
      ]);
    });
  controlFolder
    .add(controlConfig, 'playSegmentsLastFrame', 0, 101)
    .onChange((lastFrame) => {
      pointerAnimation.playSegments([
        controlConfig.playSegmentsFirstFrame,
        lastFrame,
      ]);
    });
  controlFolder.open();
}
