---
'@antv/g': patch
---

perf: update animation promises once per frame instead of once per started animation, so starting N animations in one task no longer costs O(N²) on the next frame
