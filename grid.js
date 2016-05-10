// grid.js require turf.js to build geojson grid

/* 
	这边确定几个规则，
	1.图层可见并且在RealRes分辨率以上，则开启简化。
	2.图层在RealRes分辨率之下，则显示原始图形。

	Thinking：
	1.实时简化算法需要耗时计算，不简化则交互卡顿，如何平衡。
	2.可否考虑构建矢量数据金字塔，存成多层级geojson。
	3.加载本地LOD，根据分辨率，加载对应层级geojson。
 */

var lodpara = {
	fs: null,
	formater: new ol.format.GeoJSON(),
	/*maxfsInExtent: 1000,*/
	greenstyle: new ol.style.Style({
            fill: new ol.style.Fill({
              color: '#94E452'
            })
          }),
	tolratio: 3.00,

	/* 10m 分辨率以下就不做简化。。数据量大，简化算法太费时 */
	noSimpleRes: 10

}

map.getView().on('change:resolution',function(evt){
	console.log(evt);
	var resolution = map.getView().getResolution();
	var tolerance = resolution*3.00;
	console.log('resolution change: ' + resolution);
	getlayername('110m_land.shp')?getlayername('110m_land.shp').setMinResolution(6000):console.log('');
	try{
		var layer = getlayername('Green.shp')?getlayername('Green.shp'):null;
		if (!layer){return;}
		layer.setStyle(lodpara.greenstyle);
		// 最大可见分辨率，320m，小于20m则不开简化。
		layer.setMaxResolution(320);
		if (resolution > 320){return;}
		else if (resolution <10) {
			layer.getSource().clear();
			layer.getSource().addFeatures(lodpara.fs);
			return;
		}
		// 如果已经深度拷贝原始要素信息，则每次都从原始要素计算简化。
		lodpara.fs = lodpara.fs?lodpara.fs:layer.getSource().getFeatures().concat();

		var simfeature = null;
		var simfeatures = [];
		var stime = new Date().getTime();
		for (var i = 0; i < lodpara.fs.length; i++) {
			// featureobj 2 jsonstr
			/*if (i>500){break;}*/
			var geojsonstr = lodpara.formater.writeFeature(lodpara.fs[i]);

			/* input JSONobject */
			simfeature = turf.simplify(JSON.parse(geojsonstr), tolerance, false);
			simfeatures.push(lodpara.formater.readFeature(JSON.stringify(simfeature)));
		}
		layer.getSource().clear();
		var etime = new Date().getTime();
		console.log('simplify tolerance '+ tolerance +' finished, clear old feauture. elapsed: '+ (etime-stime)+ 'ms');
		layer.getSource().addFeatures(simfeatures);		
	}
	catch(e){
		console.log(e);
	}
})

