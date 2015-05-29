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
        customOverlay: function(customOptions) {
            var marker = new CustomMarker(customOptions, this.map);
            this.markers.push(marker);
            return this;
        },
        infoWindow: function(contents) {
            var marker = this.markers[this.markers.length - 1];
            var iw = this.infowindow;
            google.maps.event.addListener(marker, 'click', function() {
                console.log(contents);
                iw.setContent(contents);
                iw.open(this.map, marker);
            });

            return this;
        }
    }

    var CustomMarker = function(customOptions, map) {
        this.latlng = new google.maps.LatLng(customOptions.position.lat, customOptions.position.lng);
        this.customOptions = customOptions;
        this.setMap(map);
        this.div = null;
    };

    CustomMarker.prototype = $.extend(new google.maps.OverlayView(), {
        draw: function() {
            var me = this;
            var div = this.div;
            var html = this.customOptions.html;

            if(!div) {
                div = this.div = $(html).css({ // setting custom markup
                    position: 'absolute',
                    cursor: 'pointer',
                    width: '40px',
                    height: '40px',
                    borderRadius: '20px',
                    backgroundColor: '#f60',
                    color: '#fff',
                    fontWeight: 800,
                    marginLeft: '-20px',
                    boxShadow: '2px 2px 2px 2px rgba(0, 0, 0, 0.6)'
                })[0];

                google.maps.event.addDomListener(div, 'click', function(e) {
                    google.maps.event.trigger(me, 'click', e);
                });

                var panes = this.getPanes();
                panes.overlayImage.appendChild(div);
            }

            var point = this.getProjection().fromLatLngToDivPixel(this.latlng);
            if(point) {
                div.style.left = point.x + 'px';
                div.style.top = point.y + 'px';
            }
        },
        remove: function() {
            if(this.div) {
                this.div.parentNode.removeChild(this.div);
                this.div = null;
            }
        },
        getPosition: function() {
            return this.latlng;
        }
    });


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
                        html: '<div id="' + data.id + '">' + data.name + '</div>'
                    }).infoWindow(data.name);
                });
            }
        })
    }
});

