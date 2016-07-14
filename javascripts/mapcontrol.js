/*mapcontrol.js*/

var mapobj = {

};

var extent = [0, 0, 2313, 1119];
var proj = new ol.proj.Projection({
	code: 'xkcd-img',
	units: 'pixels',
	extent: extent
});

var slayer = new ol.layer.Image({
	source: new ol.source.ImageStatic({
		url: "images/bg.png",
		projection: proj,
		imageExtent: extent
	})
});

var tdtImg = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: "http://t{1-7}.tianditu.com/DataServer?T=img_c&x={x}&y={y}&l={z}"
            })
        });

/* test passed */
/* http://t1.tianditu.com/DataServer?T=vec_c&x=54891&y=10685&l=16 */

/* http://t0.tianditu.cn/img_c/wmts?service=wmts&request=GetTile
&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix= */


/*var vlayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: 
        format:

    })
    style: []
});*/

var map = new ol.Map({
    layers: [/*
     tian_base,
     tian_diming,*/
     slayer,
     tdtImg
    ],
    controls: ol.control.defaults({
    }).extend([
       /* new ol.control.MousePosition(),
        new ol.control.ZoomSlider()*/
    ]),
    attributions: '',
    target: 'mapcontainer',
    view: new ol.View({
        /*center: ol.extent.getCenter(extent),
        projection: proj,
        zoom: 2,
        minZoom: 2,
        maxZoom: 5*/
        proj: new ol.proj.Projection(3857),
        center: ol.proj.transform([121.500, 76.267], 'EPSG:4326', 'EPSG:3857'),
        zoom: 17,
        maxZoom: 18
    })
});

utils.events.addEvent($('header'), 'mousemove', 
    function(){
        console.log('move!')
    });

/* onclick = func ->  DOM 0 event. */
$('.day_vlayer').onclick = function(){
    console.log('layerSwitching to day_vlayer');
}

utils.events.addEvent($('.night_layer'), 'click', 
    function(){
        console.log('layerSwitching to night_layer');
    });



