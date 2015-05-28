// Invoke 'strict' JavaScript mode
'use strict';

(function($) {

    var _callback = {
        ready: function() {}
    }

    var Geomap = function(element, mapOptions, callback) {
        this.element = $(element);
        this.mapOptions = mapOptions || {};
        this.callback = $.extend(_callback, callback);

        this.markers = [];
        this.infowindow = new google.maps.InfoWindow({})

        this.init_();
    };

    Geomap.prototype = {
        init_: function() {
            this.map = new google.maps.Map(this.element[0], this.mapOptions);
            this.callback.ready(this, this.map);
        },
        marker: function(markerOptions) {
            markerOptions = $.extend({ map: this.map }, markerOptions);
            var marker = new google.maps.Marker(markerOptions);
            this.markers.push(marker);
            return this;
        },
        customOverlay: function() {
            return this;
        },
        infoWindow: function(contents) {
            var marker = this.markers[this.markers.length - 1];
            var iw = this.infowindow;
            google.maps.event.addListener(marker, 'click', function() {
                iw.setContent(contents);
                iw.open(this.map, marker);
            });

            return this;
        }
    }


    $.geoMap = function(element, mapOptions, callback) {
        if(typeof element === 'object') {
            callback = mapOptions;
            mapOptions = element;
            element =  mapOptions.canvas;
        }

        if(typeof callback === 'undefined') {
            callback = {};
        } else if(typeof callback === 'function') {
            callback = new Object({
                ready: callback
            });
        }

        $(function() {
            new Geomap(element, mapOptions, callback);
        })
    };


})(jQuery);



$.geoMap({
    canvas: '#map-canvas',
    center: { lat: 35.88634, lng: 128.6284071 },
    zoom: 18
}, {
    ready: function(geomap) {
        $.ajax({
            url: '../test/geodata.json',
            success: function(data) {
                $(data).each(function(i, data) {
                     geomap.customOverlay({
                        position: data.geodata,
                        title: data.name,
                        animation: google.maps.Animation.DROP
                    }).infoWindow(data.name);
                });
            }
        })
    }
});

