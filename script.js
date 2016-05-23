jQuery(function () {
    jQuery('.clear').on('click', function () {
        map.once('postcompose', function (event) {
            vector.getSource().clear();
            setLocalStorage(data);
        });
    });
    jQuery('.save').on('click', function () {
        map.once('postcompose', function (event) {
            var geojson = new ol.format.GeoJSON();
            var data = geojson.writeFeatures(vector.getSource().getFeatures());
            setLocalStorage(data);
        });
    });
    appendSavedPaths();
});

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
    path.forEach(function (e, i) {
        jQuery('.saved').append('<li data-id="' + i + '">Path #' + i + 1 + '<span class="btn btn-default load">Load</span></li>');
    })
}

var paths;
/**
 * Returns every stored paths
 * @returns {Array} Stored paths formatted to GeoJSON.
 */
function getLocalStorage() {
    if (localStorage.pix4d) {
        paths = localStorage.pix4d.parse();
    } else {
        localStorage.pix4d = "[]";
    }
    return paths;
}

/**
 * Saves the paths to LocalStorage
 * @param {object} JSONdraw GeoJSON-based object.
 */
function setLocalStorage(JSONdraw) {
    var values, local;
    local = localStorage.pix4d;
    values = local.parse();
    values.push(JSONdraw.parse());
    localStorage.pix4d = values.stringify();
}
