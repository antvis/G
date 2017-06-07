var Util = require('@ali/g-util');
var Tween = require('@ali/g-tween');
var tween = new Tween();

module.exports = {
  tween: tween,
  animate: function(toProps, duration, easing, callBack) {
    var now = tween.getNow();
    var cfg = Util.mix({}, toProps, {
      duration: duration
    });
    tween.animate(this).append(now, cfg, easing, callBack);
    if (tween.get('status') === 'silent') tween.play();
  }
};
