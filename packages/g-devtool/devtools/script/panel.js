//
// script execute function
//

// execute raw script in inspect window
var executeScriptInInspectWindow = function (script) {
  return new Promise(function (resolve, reject) {
    chrome.devtools.inspectedWindow.eval(script, function (result, exception) {
      if (exception) {
        reject(exception);
      } else {
        resolve(result);
      }
    });
  });
};

// execute function in anynomous code block
var executeFuntionInInspectWindow = function (func, args) {
  return executeScriptInInspectWindow(
    `(${func.toString()}).apply(window, ${JSON.stringify(args)})`
  );
};

//
// these are the function that execute in inspect window
//

function doFPSThings() {
  if (window.__g_fps) {
    cancelAnimationFrame(window.__g_fps);
  }
  let lastCalledTime;
  let fps;
  let delta;

  function requestAnimFrame() {
    if (!lastCalledTime) {
      lastCalledTime = performance.now();
      fps = 0;
    } else {
      delta = (performance.now() - lastCalledTime) / 1000;
      lastCalledTime = performance.now();
      fps = 1 / delta;
    }
    window.__g_fps_value = Math.round(fps);
    window.__g_fps = requestAnimationFrame(requestAnimFrame);
  }

  requestAnimFrame();
}

// get global G Canvas structure
function getGlobalInstances() {
  var instances = window.__g_instances__;
  var gmap = {};
  var getCanvasRootGroup = function (canvas) {
    if (canvas.getRoot) {
      return canvas.getRoot().getChildren();
    } else if (canvas.getChildren) {
      return canvas.getChildren();
    }

    return [];
  };
  window.__g_instances__.globalMap = gmap;
  var gInfo = [];
  function getGInstance(instance) {
    const ga = {};
    if (instance.getChildren && instance.getChildren()) {
      ga.children = instance.getChildren().map(function (p) {
        return getGInstance(p);
      });
    }

    if (!instance.__dev_hash) {
      ga.hash = Math.random().toString(16).slice(-8);
      instance.__dev_hash = ga.hash;
    } else {
      ga.hash = instance.__dev_hash;
    }

    gmap[ga.hash] = instance;
    ga.id = instance.id || instance.get("id");
    ga.name = instance.name || instance.get("name");
    ga.type = instance.get("type") || instance.nodeName || "group";
    return ga;
  }

  if (instances && instances.length) {
    gInfo = instances.map(function (instance) {
      var hash = instance.hash || Math.random().toString(16).slice(-8);
      var ga = {
        type: "renderer",
        name: "renderer",
        nodeName: "renderer",
        hash: hash,
        children: getCanvasRootGroup(instance).map((e) => getGInstance(e)),
        memory: window.performance.memory.usedJSHeapSize,
        fps: window.__g_fps_value
      };
      instance.hash = ga.hash;
      gmap[ga.hash] = instance;
      return ga;
    });
  } else {
    gInfo.length = 0;
  }

  return gInfo;
}

function checkCanvasByHash(hash) {
  return !!window.__g_instances__.map((e) => e.hash).includes(hash);
}

function createBoxUsingId(bbox, id, color) {
  var el = document.createElement("div");
  window[id] = el;
  el.classList.add("g_devtool_rect");
  document.body.appendChild(el);
  el.style.position = "absolute";
  el.style.width = `${bbox.width}px`;
  el.style.height = `${bbox.height}px`;
  el.style.top = `${bbox.top}px`;
  el.style.left = `${bbox.left}px`;
  el.style.background = color || "rgba(135, 59, 244, 0.5)";
  el.style.border = "2px dashed rgb(135, 59, 244)";
  el.style.boxSizing = "border-box";
}

function removeBoxUsingId(id) {
  if (window[id]) {
    window[id].remove();
  }
}

function removeAllBox() {
  var elements = document.getElementsByClassName("g_devtool_rect");
  [].forEach.apply(elements, [
    function (e) {
      e.remove();
    },
  ]);
}

function getElemetBBoxByHash(hash) {
  var targetEl = window.__g_instances__.globalMap[hash];
  if (targetEl.getBoundingClientRect) {
    return targetEl.getBoundingClientRect();
  }
  var bbox = targetEl.getCanvasBBox();
  var target = targetEl.getCanvas().getClientByPoint(bbox.x, bbox.y);

  bbox.left = target.x;
  bbox.top = target.y;

  return bbox;
}

function getElementAttrByHash(hash) {
  return window.__g_instances__.globalMap[hash].attr();
}

function setElementAttrByHash(hash, name, value) {
  return window.__g_instances__.globalMap[hash].attr(name, value);
}

function setGElementByHash(hash) {
  window.$gElemet = hash ? window.__g_instances__.globalMap[hash] : undefined;
}

function consoleElementByHash(hash, desc) {
  window.console.log(
    desc || "<Click To Expand>",
    window.__g_instances__.globalMap[hash]
  );
}

//
// these are the functions that run in devtools panel
//

function setRect(bbox, id, color) {
  executeFuntionInInspectWindow(removeBoxUsingId, [id]).finally(() => {
    executeFuntionInInspectWindow(createBoxUsingId, [bbox, id, color]);
  });
}

function cleanRect(id) {
  executeFuntionInInspectWindow(removeBoxUsingId, [id]);
}

function showRect(hash, id, color) {
  executeFuntionInInspectWindow(getElemetBBoxByHash, [hash]).then((bbox) => {
    setRect(bbox, id, color);
  });
}

function cleanAllRect() {
  executeFuntionInInspectWindow(removeAllBox);
}

function getAttrs(hash) {
  if (hash) {
    executeFuntionInInspectWindow(setGElementByHash, [hash]);
    return executeFuntionInInspectWindow(getElementAttrByHash, [hash]);
  }
  return executeFuntionInInspectWindow(setGElementByHash, []);
}

function updateAttrs(hash, name, attrs) {
  return executeFuntionInInspectWindow(setElementAttrByHash, [
    hash,
    name,
    attrs,
  ]);
}

function consoleEl(hash, desc) {
  return executeFuntionInInspectWindow(consoleElementByHash, [hash, desc]);
}

function checkCanvasAlive(hash) {
  return executeFuntionInInspectWindow(checkCanvasByHash, [hash]).then(
    (res) => {
      if (res) {
        return true;
      } else {
        return false;
      }
    }
  );
}

function getNowCanvasData() {
  return executeFuntionInInspectWindow(getGlobalInstances);
}
function startFPSMonitor() {
  return executeFuntionInInspectWindow(doFPSThings);
}

getNowCanvasData().then(function (data) {
  const container = document.getElementById("container");
  mount(data, container, {
    showRect,
    getAttrs,
    cleanRect,
    updateAttrs,
    consoleEl,
    checkCanvasAlive,
    getNowCanvasData,
    cleanAllRect,
    startFPSMonitor
  });
});

startFPSMonitor()
