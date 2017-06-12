const Util = require('../../../util/index');
const Tween = require('@ali/g-tween');
const tween = new Tween();

module.exports = {
  tween,
  animate(toProps, duration, easing, callBack) {
    const now = tween.getNow();
    const cfg = Util.merge({}, toProps, {
      duration
    });
    tween.animate(this).append(now, cfg, easing, callBack);
    if (tween.get('status') === 'silent') tween.play();
  }
};
