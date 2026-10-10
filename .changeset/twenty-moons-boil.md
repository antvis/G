---
'@antv/g-lite': patch
---

Replace spread push with for-of loop in PrepareRendererPlugin to avoid potential call stack overflow when processing large mutation record arrays.
