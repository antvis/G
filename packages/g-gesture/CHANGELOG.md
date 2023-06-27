# [@antv/g-gesture-v2.1.0](https://github.com/antvis/g/compare/@antv/g-gesture@2.0.0...@antv/g-gesture@2.1.0) (2023-06-27)

## 2.2.0

### Minor Changes

-   Remove default export in @antv/g-math

### Patch Changes

-   Updated dependencies
    -   @antv/g-lite@1.2.0

### Bug Fixes

-   add reflect-metadata to dependencies ([#1154](https://github.com/antvis/g/issues/1154)) ([47e4822](https://github.com/antvis/g/commit/47e4822500e9ef2cf74cbd374662928a1934dedc))
-   annotation ([#1126](https://github.com/antvis/g/issues/1126)) ([9569ffc](https://github.com/antvis/g/commit/9569ffcf90cd6fc946d5c342571cb42efcfeaf6a))
-   annotation plugin ([#1132](https://github.com/antvis/g/issues/1132)) ([b5719eb](https://github.com/antvis/g/commit/b5719eb92ccfb9dbd04d5e1aee84398238b1d832))
-   change canvas' init hook frin async to sync [#1117](https://github.com/antvis/g/issues/1117) ([#1368](https://github.com/antvis/g/issues/1368)) ([037f76e](https://github.com/antvis/g/commit/037f76e73dfcd47843fcda2e2151139c65ac2934))
-   clippath & dragndrop events ([#1196](https://github.com/antvis/g/issues/1196)) ([7b41fba](https://github.com/antvis/g/commit/7b41fbad273d0a3f3a1108eaefab3908366001fb)), closes [#1079](https://github.com/antvis/g/issues/1079)
-   clipPath should only affect renderBounds [#1157](https://github.com/antvis/g/issues/1157) ([#1158](https://github.com/antvis/g/issues/1158)) ([acdf158](https://github.com/antvis/g/commit/acdf15865ef65b01a6985cf2ffa6ca5f23c1d21e))
-   delay the calculation of path totallength [#1141](https://github.com/antvis/g/issues/1141) ([#1142](https://github.com/antvis/g/issues/1142)) ([09e1776](https://github.com/antvis/g/commit/09e1776e09e9ff3b40e5fa21eb4ad6febde60495)), closes [#1140](https://github.com/antvis/g/issues/1140)
-   delay updating attributes to the end of frame [#1164](https://github.com/antvis/g/issues/1164) ([#1168](https://github.com/antvis/g/issues/1168)) ([f481765](https://github.com/antvis/g/commit/f481765e8b5a83c7a13fd40adb63593048a6e25a)), closes [#1172](https://github.com/antvis/g/issues/1172) [#1172](https://github.com/antvis/g/issues/1172) [#1171](https://github.com/antvis/g/issues/1171)
-   event bug ([#1278](https://github.com/antvis/g/issues/1278)) ([fe4a3d8](https://github.com/antvis/g/commit/fe4a3d8370119753a9ac8208bc713391847bc856))
-   isDisplayObject should account for null & undefined value ([#1272](https://github.com/antvis/g/issues/1272)) ([28bb962](https://github.com/antvis/g/commit/28bb9629cb44c89e12064daf4f132f90e73a6c14))
-   make HTML shape affected with camera [#1121](https://github.com/antvis/g/issues/1121) ([#1182](https://github.com/antvis/g/issues/1182)) ([0fcaeb4](https://github.com/antvis/g/commit/0fcaeb45f986252674131c2b428bd972d4c485e9)), closes [#1163](https://github.com/antvis/g/issues/1163) [#1179](https://github.com/antvis/g/issues/1179)
-   preprocess path and generate bbox of each segment for later use [#1193](https://github.com/antvis/g/issues/1193) ([#1194](https://github.com/antvis/g/issues/1194)) ([0e3f66d](https://github.com/antvis/g/commit/0e3f66d900e5cc422b00ea34d1493c3e91ed5048)), closes [#1191](https://github.com/antvis/g/issues/1191)
-   reduce CSS Typed OM creation ([#1124](https://github.com/antvis/g/issues/1124)) ([e32cbff](https://github.com/antvis/g/commit/e32cbffe7bc059c47618942897ec0fd34bb4089a))
-   remove the usage of since it's not allowed under miniapp's envi… ([#1334](https://github.com/antvis/g/issues/1334)) ([22bba8b](https://github.com/antvis/g/commit/22bba8b6cb2a6434d21704dda082c96c431dbbac)), closes [#1304](https://github.com/antvis/g/issues/1304)
-   resolve inheritable value correctly ([#1135](https://github.com/antvis/g/issues/1135)) ([3840cc2](https://github.com/antvis/g/commit/3840cc2a1098ef3cc9af58115d05fbbf27d0aa5f))
-   speed up the promise of animation ([#1130](https://github.com/antvis/g/issues/1130)) ([a82b315](https://github.com/antvis/g/commit/a82b315c074b61f9a045262eec4c3a8295112e71)), closes [#1129](https://github.com/antvis/g/issues/1129) [#1131](https://github.com/antvis/g/issues/1131)
-   support key point in annotation plugin ([#1146](https://github.com/antvis/g/issues/1146)) ([4240138](https://github.com/antvis/g/commit/4240138d488c10f85908e31299c8b0422d2c7666))
-   support rendering polyline & polygon in annotation plugin ([#1134](https://github.com/antvis/g/issues/1134)) ([b615f95](https://github.com/antvis/g/commit/b615f952742c5874fccd675ad9bfed52b3b09180))
-   support undo action when drawing polyline & polygon ([#1136](https://github.com/antvis/g/issues/1136)) ([66b47ae](https://github.com/antvis/g/commit/66b47aeda42f97a172db8670d00d36f236799c72))
-   trigger deselect event when removed ([#1133](https://github.com/antvis/g/issues/1133)) ([a09b980](https://github.com/antvis/g/commit/a09b9805ef3a55695d0d00df520a13182fbf47a2))
-   use arrow key to move target in annotation plugin ([#1138](https://github.com/antvis/g/issues/1138)) ([3940180](https://github.com/antvis/g/commit/3940180f70c87ef0174ef361301bcfbf87f9e551))
-   use correct isFunction ([#1156](https://github.com/antvis/g/issues/1156)) ([596edba](https://github.com/antvis/g/commit/596edbae83ce0e9aa26b410fcc692ec3e9567b37))
-   use world coordinates in clipPath ([#1181](https://github.com/antvis/g/issues/1181)) ([4f7786b](https://github.com/antvis/g/commit/4f7786b817b1141a198ea76c9747e64fe050adec)), closes [#1180](https://github.com/antvis/g/issues/1180) [#1170](https://github.com/antvis/g/issues/1170)
-   手势事件修改成同步触发 ([#1318](https://github.com/antvis/g/issues/1318)) ([1ab30c5](https://github.com/antvis/g/commit/1ab30c5817b7522cc17edcb916067c87c595a9b8))

### Features

-   a simple lottie player ([#1190](https://github.com/antvis/g/issues/1190)) ([0444cab](https://github.com/antvis/g/commit/0444cab266cfd0e82aee65ac91c647e27a75781f)), closes [#1147](https://github.com/antvis/g/issues/1147)
-   add a Lottie player ([#1162](https://github.com/antvis/g/issues/1162)) ([a33b350](https://github.com/antvis/g/commit/a33b350be07d164bcbe930a063668f774f22bc66))
-   add alwaysTriggerPointermoveEvent option in Canvas ([#1332](https://github.com/antvis/g/issues/1332)) ([b3c776d](https://github.com/antvis/g/commit/b3c776d865146ee07d25e0548bd476fb70ac9fe8))
-   add elementsFromBBox on document ([#1152](https://github.com/antvis/g/issues/1152)) ([2d0c7f8](https://github.com/antvis/g/commit/2d0c7f8ee9023da187b54756f2b263790a11cbb6)), closes [#1148](https://github.com/antvis/g/issues/1148) [#1151](https://github.com/antvis/g/issues/1151) [#1150](https://github.com/antvis/g/issues/1150)
-   allow camera zoom by specified point in viewport coordinates [#1173](https://github.com/antvis/g/issues/1173) ([#1175](https://github.com/antvis/g/issues/1175)) ([34eb6c1](https://github.com/antvis/g/commit/34eb6c178c468fbeea9618001e331ba1e10b92d8))
-   allow constructing pattern with basic shapes [#1226](https://github.com/antvis/g/issues/1226) ([#1227](https://github.com/antvis/g/issues/1227)) ([13b5bf7](https://github.com/antvis/g/commit/13b5bf7eea905ef2486485d03c8bc80da0755616)), closes [#1225](https://github.com/antvis/g/issues/1225)
-   init annotation plugin ([#1069](https://github.com/antvis/g/issues/1069)) ([8e9e301](https://github.com/antvis/g/commit/8e9e3017547b56e3445c0ff652c69d64de43e374)), closes [#1108](https://github.com/antvis/g/issues/1108) [#1077](https://github.com/antvis/g/issues/1077) [#1109](https://github.com/antvis/g/issues/1109) [#1109](https://github.com/antvis/g/issues/1109) [#1111](https://github.com/antvis/g/issues/1111) [#1112](https://github.com/antvis/g/issues/1112) [#1113](https://github.com/antvis/g/issues/1113) [#1114](https://github.com/antvis/g/issues/1114) [#1115](https://github.com/antvis/g/issues/1115) [#1116](https://github.com/antvis/g/issues/1116) [#1117](https://github.com/antvis/g/issues/1117)
-   keep selected order after brush selection completed [#1297](https://github.com/antvis/g/issues/1297) ([#1298](https://github.com/antvis/g/issues/1298)) ([ae94423](https://github.com/antvis/g/commit/ae94423f924b49890dcc196a86f1c759c5012235)), closes [#1286](https://github.com/antvis/g/issues/1286)
-   support 'pixels' in pointer-events [#1373](https://github.com/antvis/g/issues/1373) ([#1374](https://github.com/antvis/g/issues/1374)) ([3595884](https://github.com/antvis/g/commit/35958840b44ee58a157f90043530b3fc34686c18)), closes [#1325](https://github.com/antvis/g/issues/1325) [#1375](https://github.com/antvis/g/issues/1375)
-   support advanced features in radial-gradient [#1165](https://github.com/antvis/g/issues/1165) ([#1167](https://github.com/antvis/g/issues/1167)) ([407f5e2](https://github.com/antvis/g/commit/407f5e24d3443e6c2f37ee27452a57b39b704931)), closes [#1143](https://github.com/antvis/g/issues/1143) [#1161](https://github.com/antvis/g/issues/1161)
-   support fill-rule in g-canvas & g-svg ([#1178](https://github.com/antvis/g/issues/1178)) ([3f764a4](https://github.com/antvis/g/commit/3f764a4cf3f1e8a9eae93d7e80aa3d0eeefb2406)), closes [#1104](https://github.com/antvis/g/issues/1104) [#1177](https://github.com/antvis/g/issues/1177)
-   support text-overflow in Text [#1149](https://github.com/antvis/g/issues/1149) ([#1160](https://github.com/antvis/g/issues/1160)) ([48fa295](https://github.com/antvis/g/commit/48fa295feda2cd25cb5a52dc311c87bbfc341c57)), closes [#1153](https://github.com/antvis/g/issues/1153) [#1147](https://github.com/antvis/g/issues/1147)
-   support toggle visibility of rotate anchor in annotation plugin ([#1346](https://github.com/antvis/g/issues/1346)) ([9b0b010](https://github.com/antvis/g/commit/9b0b010803d2b022ed0a5f600496060921ceacdd)), closes [#925](https://github.com/antvis/g/issues/925)
-   添加取消事件 ([#1316](https://github.com/antvis/g/issues/1316)) ([cd6e417](https://github.com/antvis/g/commit/cd6e417d9deefa0fece134e8ba69464490650b6d))

# [@antv/g-gesture-v2.1.0-beta.1](https://github.com/antvis/g/compare/@antv/g-gesture@2.0.0...@antv/g-gesture@2.1.0-beta.1) (2023-06-26)

### Bug Fixes

-   add reflect-metadata to dependencies ([#1154](https://github.com/antvis/g/issues/1154)) ([47e4822](https://github.com/antvis/g/commit/47e4822500e9ef2cf74cbd374662928a1934dedc))
-   annotation ([#1126](https://github.com/antvis/g/issues/1126)) ([9569ffc](https://github.com/antvis/g/commit/9569ffcf90cd6fc946d5c342571cb42efcfeaf6a))
-   annotation plugin ([#1132](https://github.com/antvis/g/issues/1132)) ([b5719eb](https://github.com/antvis/g/commit/b5719eb92ccfb9dbd04d5e1aee84398238b1d832))
-   change canvas' init hook frin async to sync [#1117](https://github.com/antvis/g/issues/1117) ([#1368](https://github.com/antvis/g/issues/1368)) ([037f76e](https://github.com/antvis/g/commit/037f76e73dfcd47843fcda2e2151139c65ac2934))
-   clippath & dragndrop events ([#1196](https://github.com/antvis/g/issues/1196)) ([7b41fba](https://github.com/antvis/g/commit/7b41fbad273d0a3f3a1108eaefab3908366001fb)), closes [#1079](https://github.com/antvis/g/issues/1079)
-   clipPath should only affect renderBounds [#1157](https://github.com/antvis/g/issues/1157) ([#1158](https://github.com/antvis/g/issues/1158)) ([acdf158](https://github.com/antvis/g/commit/acdf15865ef65b01a6985cf2ffa6ca5f23c1d21e))
-   delay the calculation of path totallength [#1141](https://github.com/antvis/g/issues/1141) ([#1142](https://github.com/antvis/g/issues/1142)) ([09e1776](https://github.com/antvis/g/commit/09e1776e09e9ff3b40e5fa21eb4ad6febde60495)), closes [#1140](https://github.com/antvis/g/issues/1140)
-   delay updating attributes to the end of frame [#1164](https://github.com/antvis/g/issues/1164) ([#1168](https://github.com/antvis/g/issues/1168)) ([f481765](https://github.com/antvis/g/commit/f481765e8b5a83c7a13fd40adb63593048a6e25a)), closes [#1172](https://github.com/antvis/g/issues/1172) [#1172](https://github.com/antvis/g/issues/1172) [#1171](https://github.com/antvis/g/issues/1171)
-   event bug ([#1278](https://github.com/antvis/g/issues/1278)) ([fe4a3d8](https://github.com/antvis/g/commit/fe4a3d8370119753a9ac8208bc713391847bc856))
-   isDisplayObject should account for null & undefined value ([#1272](https://github.com/antvis/g/issues/1272)) ([28bb962](https://github.com/antvis/g/commit/28bb9629cb44c89e12064daf4f132f90e73a6c14))
-   make HTML shape affected with camera [#1121](https://github.com/antvis/g/issues/1121) ([#1182](https://github.com/antvis/g/issues/1182)) ([0fcaeb4](https://github.com/antvis/g/commit/0fcaeb45f986252674131c2b428bd972d4c485e9)), closes [#1163](https://github.com/antvis/g/issues/1163) [#1179](https://github.com/antvis/g/issues/1179)
-   preprocess path and generate bbox of each segment for later use [#1193](https://github.com/antvis/g/issues/1193) ([#1194](https://github.com/antvis/g/issues/1194)) ([0e3f66d](https://github.com/antvis/g/commit/0e3f66d900e5cc422b00ea34d1493c3e91ed5048)), closes [#1191](https://github.com/antvis/g/issues/1191)
-   reduce CSS Typed OM creation ([#1124](https://github.com/antvis/g/issues/1124)) ([e32cbff](https://github.com/antvis/g/commit/e32cbffe7bc059c47618942897ec0fd34bb4089a))
-   remove the usage of since it's not allowed under miniapp's envi… ([#1334](https://github.com/antvis/g/issues/1334)) ([22bba8b](https://github.com/antvis/g/commit/22bba8b6cb2a6434d21704dda082c96c431dbbac)), closes [#1304](https://github.com/antvis/g/issues/1304)
-   resolve inheritable value correctly ([#1135](https://github.com/antvis/g/issues/1135)) ([3840cc2](https://github.com/antvis/g/commit/3840cc2a1098ef3cc9af58115d05fbbf27d0aa5f))
-   speed up the promise of animation ([#1130](https://github.com/antvis/g/issues/1130)) ([a82b315](https://github.com/antvis/g/commit/a82b315c074b61f9a045262eec4c3a8295112e71)), closes [#1129](https://github.com/antvis/g/issues/1129) [#1131](https://github.com/antvis/g/issues/1131)
-   support key point in annotation plugin ([#1146](https://github.com/antvis/g/issues/1146)) ([4240138](https://github.com/antvis/g/commit/4240138d488c10f85908e31299c8b0422d2c7666))
-   support rendering polyline & polygon in annotation plugin ([#1134](https://github.com/antvis/g/issues/1134)) ([b615f95](https://github.com/antvis/g/commit/b615f952742c5874fccd675ad9bfed52b3b09180))
-   support undo action when drawing polyline & polygon ([#1136](https://github.com/antvis/g/issues/1136)) ([66b47ae](https://github.com/antvis/g/commit/66b47aeda42f97a172db8670d00d36f236799c72))
-   trigger deselect event when removed ([#1133](https://github.com/antvis/g/issues/1133)) ([a09b980](https://github.com/antvis/g/commit/a09b9805ef3a55695d0d00df520a13182fbf47a2))
-   use arrow key to move target in annotation plugin ([#1138](https://github.com/antvis/g/issues/1138)) ([3940180](https://github.com/antvis/g/commit/3940180f70c87ef0174ef361301bcfbf87f9e551))
-   use correct isFunction ([#1156](https://github.com/antvis/g/issues/1156)) ([596edba](https://github.com/antvis/g/commit/596edbae83ce0e9aa26b410fcc692ec3e9567b37))
-   use world coordinates in clipPath ([#1181](https://github.com/antvis/g/issues/1181)) ([4f7786b](https://github.com/antvis/g/commit/4f7786b817b1141a198ea76c9747e64fe050adec)), closes [#1180](https://github.com/antvis/g/issues/1180) [#1170](https://github.com/antvis/g/issues/1170)
-   手势事件修改成同步触发 ([#1318](https://github.com/antvis/g/issues/1318)) ([1ab30c5](https://github.com/antvis/g/commit/1ab30c5817b7522cc17edcb916067c87c595a9b8))

### Features

-   a simple lottie player ([#1190](https://github.com/antvis/g/issues/1190)) ([0444cab](https://github.com/antvis/g/commit/0444cab266cfd0e82aee65ac91c647e27a75781f)), closes [#1147](https://github.com/antvis/g/issues/1147)
-   add a Lottie player ([#1162](https://github.com/antvis/g/issues/1162)) ([a33b350](https://github.com/antvis/g/commit/a33b350be07d164bcbe930a063668f774f22bc66))
-   add alwaysTriggerPointermoveEvent option in Canvas ([#1332](https://github.com/antvis/g/issues/1332)) ([b3c776d](https://github.com/antvis/g/commit/b3c776d865146ee07d25e0548bd476fb70ac9fe8))
-   add elementsFromBBox on document ([#1152](https://github.com/antvis/g/issues/1152)) ([2d0c7f8](https://github.com/antvis/g/commit/2d0c7f8ee9023da187b54756f2b263790a11cbb6)), closes [#1148](https://github.com/antvis/g/issues/1148) [#1151](https://github.com/antvis/g/issues/1151) [#1150](https://github.com/antvis/g/issues/1150)
-   allow camera zoom by specified point in viewport coordinates [#1173](https://github.com/antvis/g/issues/1173) ([#1175](https://github.com/antvis/g/issues/1175)) ([34eb6c1](https://github.com/antvis/g/commit/34eb6c178c468fbeea9618001e331ba1e10b92d8))
-   allow constructing pattern with basic shapes [#1226](https://github.com/antvis/g/issues/1226) ([#1227](https://github.com/antvis/g/issues/1227)) ([13b5bf7](https://github.com/antvis/g/commit/13b5bf7eea905ef2486485d03c8bc80da0755616)), closes [#1225](https://github.com/antvis/g/issues/1225)
-   init annotation plugin ([#1069](https://github.com/antvis/g/issues/1069)) ([8e9e301](https://github.com/antvis/g/commit/8e9e3017547b56e3445c0ff652c69d64de43e374)), closes [#1108](https://github.com/antvis/g/issues/1108) [#1077](https://github.com/antvis/g/issues/1077) [#1109](https://github.com/antvis/g/issues/1109) [#1109](https://github.com/antvis/g/issues/1109) [#1111](https://github.com/antvis/g/issues/1111) [#1112](https://github.com/antvis/g/issues/1112) [#1113](https://github.com/antvis/g/issues/1113) [#1114](https://github.com/antvis/g/issues/1114) [#1115](https://github.com/antvis/g/issues/1115) [#1116](https://github.com/antvis/g/issues/1116) [#1117](https://github.com/antvis/g/issues/1117)
-   keep selected order after brush selection completed [#1297](https://github.com/antvis/g/issues/1297) ([#1298](https://github.com/antvis/g/issues/1298)) ([ae94423](https://github.com/antvis/g/commit/ae94423f924b49890dcc196a86f1c759c5012235)), closes [#1286](https://github.com/antvis/g/issues/1286)
-   support 'pixels' in pointer-events [#1373](https://github.com/antvis/g/issues/1373) ([#1374](https://github.com/antvis/g/issues/1374)) ([3595884](https://github.com/antvis/g/commit/35958840b44ee58a157f90043530b3fc34686c18)), closes [#1325](https://github.com/antvis/g/issues/1325) [#1375](https://github.com/antvis/g/issues/1375)
-   support advanced features in radial-gradient [#1165](https://github.com/antvis/g/issues/1165) ([#1167](https://github.com/antvis/g/issues/1167)) ([407f5e2](https://github.com/antvis/g/commit/407f5e24d3443e6c2f37ee27452a57b39b704931)), closes [#1143](https://github.com/antvis/g/issues/1143) [#1161](https://github.com/antvis/g/issues/1161)
-   support fill-rule in g-canvas & g-svg ([#1178](https://github.com/antvis/g/issues/1178)) ([3f764a4](https://github.com/antvis/g/commit/3f764a4cf3f1e8a9eae93d7e80aa3d0eeefb2406)), closes [#1104](https://github.com/antvis/g/issues/1104) [#1177](https://github.com/antvis/g/issues/1177)
-   support text-overflow in Text [#1149](https://github.com/antvis/g/issues/1149) ([#1160](https://github.com/antvis/g/issues/1160)) ([48fa295](https://github.com/antvis/g/commit/48fa295feda2cd25cb5a52dc311c87bbfc341c57)), closes [#1153](https://github.com/antvis/g/issues/1153) [#1147](https://github.com/antvis/g/issues/1147)
-   support toggle visibility of rotate anchor in annotation plugin ([#1346](https://github.com/antvis/g/issues/1346)) ([9b0b010](https://github.com/antvis/g/commit/9b0b010803d2b022ed0a5f600496060921ceacdd)), closes [#925](https://github.com/antvis/g/issues/925)
-   添加取消事件 ([#1316](https://github.com/antvis/g/issues/1316)) ([cd6e417](https://github.com/antvis/g/commit/cd6e417d9deefa0fece134e8ba69464490650b6d))

# [@antv/g-gesture-v0.1.0-beta.1](https://github.com/antvis/g/compare/@antv/g-gesture@0.0.81...@antv/g-gesture@0.1.0-beta.1) (2023-06-26)

### Bug Fixes

-   change canvas' init hook frin async to sync [#1117](https://github.com/antvis/g/issues/1117) ([#1368](https://github.com/antvis/g/issues/1368)) ([037f76e](https://github.com/antvis/g/commit/037f76e73dfcd47843fcda2e2151139c65ac2934))

### Features

-   support 'pixels' in pointer-events [#1373](https://github.com/antvis/g/issues/1373) ([#1374](https://github.com/antvis/g/issues/1374)) ([3595884](https://github.com/antvis/g/commit/35958840b44ee58a157f90043530b3fc34686c18)), closes [#1325](https://github.com/antvis/g/issues/1325) [#1375](https://github.com/antvis/g/issues/1375)

# [@antv/g-gesture-v0.1.0-alpha.1](https://github.com/antvis/g/compare/@antv/g-gesture@0.0.81...@antv/g-gesture@0.1.0-alpha.1) (2023-06-25)

### Bug Fixes

-   change canvas' init hook frin async to sync [#1117](https://github.com/antvis/g/issues/1117) ([#1368](https://github.com/antvis/g/issues/1368)) ([037f76e](https://github.com/antvis/g/commit/037f76e73dfcd47843fcda2e2151139c65ac2934))

### Features

-   support 'pixels' in pointer-events [#1373](https://github.com/antvis/g/issues/1373) ([#1374](https://github.com/antvis/g/issues/1374)) ([3595884](https://github.com/antvis/g/commit/35958840b44ee58a157f90043530b3fc34686c18)), closes [#1325](https://github.com/antvis/g/issues/1325) [#1375](https://github.com/antvis/g/issues/1375)
