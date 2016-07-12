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

var map = new ol.Map({
    layers: [/*
     tian_base,
     tian_diming,*/
     slayer
    ],
    controls: ol.control.defaults({
    }).extend([
       /* new ol.control.MousePosition(),
        new ol.control.ZoomSlider()*/
    ]),
    attributions: '',
    target: 'mapcontainer',
    view: new ol.View({
        center: ol.extent.getCenter(extent),
        projection: proj,
        zoom: 2,
        minZoom: 2,
        maxZoom: 5
    })
});

utils.events.addEvent($('header'), 'mousemove', 
    function(){console.log('move!')}
    );




