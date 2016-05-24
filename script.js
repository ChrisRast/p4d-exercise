jQuery(function () {
    jQuery('.clear').on('click', function () {
        map.once('postcompose', function (event) {
            map.getLayers().clear();
            //            vector.getSource().clear();
        });
    });
    jQuery('.save').on('click', function () {
        var that = this;
        map.once('postcompose', function (event) {
            //            jQuery(that).off();
            var geojson = new ol.format.GeoJSON();
//            var data = "";
            geojson.writeFeatures(map.getLayers().getSource().getFeatures());
            map.getLayers().forEach(function(e){
                data += geojson.writeFeatures(e.getSource().getFeatures());
            });//TODO
            //            nbPaths++;
            //            jQuery(that).attr('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data)).attr('download', 'path'+ nbPaths + '.json').click();
            setLocalStorage(data);
            jQuery(that).trigger('dataSaved');
        });
    }).on('dataSaved', function () {
        appendSavedPaths()
    });
    appendSavedPaths();
    jQuery('.saved').on('click', '.load', function () {
        //        jQuery.getJSON('paths/path1.json', function(json){
        //            var geojson = new ol.format.GeoJSON();
        //            var features = geojson.read
        //        });
        var load = decodeURIComponent(jQuery(this).attr('data-href'));
        var vectorSource = new ol.source.Vector({
            features: (new ol.format.GeoJSON()).readFeatures(load)
        });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: style
        });
        map.addLayer(vectorLayer);
    })
});

var nbPaths = 0;

var source = new ol.source.Vector({
    wrapX: false
});
var style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 0, 0, 0.2)'
    }),
    stroke: new ol.style.Stroke({
        color: '#ff0000',
        width: 3
    }),
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            color: '#ff0000'
        })
    })
});
var vector = new ol.layer.Vector({
    source: source,
    style: style
});

var map = new ol.Map({
    target: 'map',
    layers: [
                new ol.layer.Tile({
            source: new ol.source.MapQuest({
                layer: 'osm'
            })
        }),
               vector
                ],
    view: new ol.View({
        center: ol.proj.fromLonLat([6.5645689, 46.5190594]),
        zoom: 17
    })
});

var draw;

function addInteraction() {
    var value = "LineString";
    draw = new ol.interaction.Draw({
        source: source,
        type: (value)
    });
    map.addInteraction(draw);
};
addInteraction();

function appendSavedPaths() {
    var path = getLocalStorage();
    jQuery('.saved').empty();
    path.forEach(function (e, i) {
        jQuery('.saved').append('<li data-id="' + i + '">Path #' + i + ' <a data-href="' + encodeURIComponent(JSON.stringify(e)) + '" class="btn btn-default load">Load</a></li>');
    })
}

var paths = '[]';
/**
 * Returns every stored paths
 * @returns {Array} Stored paths formatted to GeoJSON.
 */
function getLocalStorage() {
    if (localStorage.getItem('pix4d')) {
        paths = JSON.parse(localStorage.getItem('pix4d'));
    } else {
        localStorage.setItem('pix4d', paths);
    }
    return paths;
}

/**
 * Saves the paths to LocalStorage
 * @param {object} JSONdraw GeoJSON-based object.
 */
function setLocalStorage(JSONdraw) {
    var local;
    local = JSON.parse(localStorage.getItem('pix4d'));
    local.push(JSON.parse(JSONdraw));
    localStorage.setItem('pix4d', JSON.stringify(local));
}