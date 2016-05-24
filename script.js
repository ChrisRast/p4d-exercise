jQuery(function () {
    localStorage.setItem('pix4d', '[]')
    appendSavedPaths();

    //Clears the current draw from the map
    jQuery('.clear').on('click', function () {
        var that = this;
        vector.getSource().clear();
        jQuery(that).trigger('dataCleared');
    }).on('dataCleared', function () {});

    //Retrieves the current draw from the map and sends it to LocalStorage
    jQuery('.save').on('click', function () {
        var that = this;
        var geojson = new ol.format.GeoJSON();
        var data = geojson.writeFeatures(vector.getSource().getFeatures());
        setLocalStorage(data);
        jQuery(that).trigger('dataSaved');
    }).on('dataSaved', function () {
        appendSavedPaths()
    });

    //Loads the saved path from html and replaces the current draw + layer.
    jQuery('.saved').on('click', '.load', function () {
        var load = decodeURIComponent(jQuery(this).attr('data-href'));
        source = new ol.source.Vector({
            wrapX: false,
            features: (new ol.format.GeoJSON()).readFeatures(load)
        });
        map.removeLayer(vector);
        map.removeInteraction(draw);
        vector = new ol.layer.Vector({
            source: source,
            style: style
        });
        map.addLayer(vector);
        addInteraction();
    });

    //Deletes the saved path from html and updates LocalStorage accordingly
    jQuery('.saved').on('click', '.delete', function () {
        var id = jQuery(this).parent().attr('data-id');
        var paths = getLocalStorage();
        paths.splice(parseInt(id), 1);
        localStorage.setItem('pix4d', JSON.stringify(paths));
        jQuery('.saved').trigger('dataDeleted');
    }).on('dataDeleted', function () {
        appendSavedPaths()
    });
});


/**
 * Creates original map and instantiate global variables
 */
var source, style, vector, map;

function createMap() {

    source = new ol.source.Vector({
        wrapX: false
    });
    style = new ol.style.Style({
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
    vector = new ol.layer.Vector({
        source: source,
        style: style
    });

    map = new ol.Map({
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
}
createMap();

var draw;

/**
 * Adds the Draw interaction to the map
 */
function addInteraction() {
    var value = "LineString";
    draw = new ol.interaction.Draw({
        source: source,
        type: (value)
    });
    map.addInteraction(draw);
};
addInteraction();


var paths = '[]';
/**
 * Returns every stored paths
 * @returns {Array} Stored paths formatted in GeoJSON.
 */
function getLocalStorage() {
    //if (localStorage.getItem('pix4d')) {
        paths = JSON.parse(localStorage.getItem('pix4d'));
    /*} else {
        localStorage.setItem('pix4d', paths);
    }*/
    return paths;
}

/**
 * Gets the paths from LocalStorage and appends them to the sidebar
 */
function appendSavedPaths() {
    var path = getLocalStorage();
    jQuery('.saved').empty();
    path.forEach(function (e, i) {
        jQuery('.saved').append('<li data-id="' + i + '">Path #' + i + ' <a data-href="' + encodeURIComponent(JSON.stringify(e)) + '" class="btn btn-default load">Load</a><a class="btn btn-default delete">Delete</a></li>');
    })
}

/**
 * Adds the draw to LocalStorage
 * @param {string} JSONdraw A stringified GeoJSON object
 */
function setLocalStorage(JSONdraw) {
    var local;
    local = JSON.parse(localStorage.getItem('pix4d'));
    local.push(JSON.parse(JSONdraw));
    localStorage.setItem('pix4d', JSON.stringify(local));
}