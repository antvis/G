/**
 * global instance and flag
 */

var panelInstance;
var itv;

function createPanelInstance() {
  if (panelInstance) {
    return;
  }

  chrome.devtools.inspectedWindow.eval(
    `!!(window.__g_instances__ && window.__g_instances__.length)`,
    function (gConnected, err) {
      if (!gConnected) {
        return;
      }

      clearInterval(itv);

      panelInstance = chrome.devtools.panels.create(
        "AntV G",
        "icons/32.png",
        "panel.html",
        function (panel) {
          panel.onHidden.addListener(function () {
            chrome.devtools.inspectedWindow.eval(`(function() {
          var elements = document.getElementsByClassName('g_devtool_rect');
          [].forEach.apply(elements, [function (e) {
            e.remove();
          }])
        })()`);
          });
        }
      );

      chrome.runtime.sendMessage({
        isAntVG: true,
        disabled: false,
      });
    }
  );
}

chrome.devtools.network.onNavigated.addListener(function () {
  // createPanelIfReactLoaded();
});

createPanelInstance();

itv = setInterval(createPanelInstance, 1000);
