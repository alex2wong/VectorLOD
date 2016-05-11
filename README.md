# VectorLOD
Webapp to build vector LOD with Javascript in order to improve performance of vector rendering

Welcome to the VectorLOD wiki!

## 整体架构

  由于本人对浏览器绘图，渲染空间数据很感兴趣，也曾经造过一些轮子。包括：
* 基本的canvas绘制html5 fileReader 读取的本地文本文件
* Javascript 读取shpfile（参考shp.js）并且借助openlayer渲染
* ...

    由于经常关注矢量数据渲染的问题，希望可以通过JS 实现空间数据的快速简化，最终实现LOD。受到OSM，mapbox以及arcgis 最新vectortile的启发， 考虑采用简化算法在每个层级根据分辨率计算响应的简化 tolerance，进行不同层级的简化，将简化后的地理数据写入本地。实现LOD离线化，只要计算过一遍的LOD文件，在之后的加载中可以直接从本地提取。

    浏览器中实现简化可以提高地图拖动时候的 性能，例如原始多边形图层节点数为5W，经过简化只剩下5k个节点。经过简化后的数据通过post提交到后台存入json文件，按照层级存入对应文件夹。

***

## 具体实现和记录

  具体实现过程，包括前端在线简化，已经实现。现在还需要增加post到后台存储的功能
