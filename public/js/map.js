/**
 * Created by Beto on 12/2/2014.
 */
var geocoder;
var map;
var lat;
var long;
var marker;
//Chạy khi khởi tạo.
function initialize() {
    geocoder = new google.maps.Geocoder();
    //Option.
    var mapOptions = {
        zoom: 20
    };
    //Tạo google map tại map-canvas cùng với option.
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    // Try HTML5 geolocation
    if (navigator.geolocation) {
        //Lấy tọa độ hiện tại:
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            lat = new google.maps.LatLng(position.coords.latitude);
            long = new google.maps.LatLng(position.coords.longitude);
            marker = new google.maps.Marker({
                draggable: true,
                position: pos,
                map: map,
                title: 'Bạn đang ở đây?',
                animation: google.maps.Animation.DROP,
                anchor: new google.maps.Point(0, 49)

            });
            google.maps.event.addListener(marker, 'drag', function (a) {
                var elem = document.getElementById("a");
                elem.value = a.latLng.lat().toFixed(7);
                var elem = document.getElementById("o");
                elem.value = a.latLng.lng().toFixed(7);
            });

            map.setCenter(pos);
        }, function () {
            handleNoGeolocation(true);
        });
    } else {
        handleNoGeolocation(false);
    }
    getLatLong();

    google.maps.event.addListener(map, "click", function (event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();

        marker.setMap(null);

        var pos = new google.maps.LatLng(lat, lng);

        marker = new google.maps.Marker({
            draggable: true,
            position: pos,
            map: map,
            title: "Bạn ở đây?",
            raiseOnDrag: false,
            animation: google.maps.Animation.DROP
        });

        google.maps.event.addListener(marker, 'drag', function (a) {
            var elem = document.getElementById("a");
            elem.value = a.latLng.lat().toFixed(7);
            var elem = document.getElementById("o");
            elem.value = a.latLng.lng().toFixed(7);
        });

        var elem = document.getElementById("a");
        elem.value = lat.toFixed(7);
        var elem = document.getElementById("o");
        elem.value = lng.toFixed(7);
    });

    var input = (document.getElementById('pac-input'));
    var click = (document.getElementById('search'));
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(click);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    var infowindow = new google.maps.InfoWindow();
    marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29),
        draggable: true,
        position: pos,
        title: "Bạn ở đây?",
        raiseOnDrag: false,
        animation: google.maps.Animation.DROP
    });

    //Event place_changed cho textbox autocomplete
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        alert("her");
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(20);  // Why 17? Because it looks good.
        }

        marker = new google.maps.Marker({
            draggable: true,
            position: pos,
            map: map,
            title: "Bạn ở đây?",
            raiseOnDrag: false,
            animation: google.maps.Animation.DROP
        });

        /*google.maps.event.addListener(marker, 'drag', function(a) {
         var elem = document.getElementById("a");
         elem.value = a.latLng.lat().toFixed(7);
         var elem = document.getElementById("o");
         elem.value = a.latLng.lng().toFixed(7);
         });*/

        marker.setPosition(place.geometry.location);
        var elem = document.getElementById("a");
        elem.value = place.geometry.location.lat().toFixed(7);
        var elem = document.getElementById("o");
        elem.value = place.geometry.location.lng().toFixed(7);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, marker);
    });
} //Hết init
function toggleBounce() {

    if (marker.getAnimation() != null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}
//Kiểm tra xem trình duyệt có hỗ trợ geolocation không?
function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
        var content = 'Error: Your browser doesn\'t support geolocation.';
    }
    var options = {
        map: map,
        position: new google.maps.LatLng(60, 105),
        content: content
    };
    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}

//Lấy lat, lng.
function getLatLong() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    //Set lat và long xuống textbox.
    var elem = document.getElementById("a");
    elem.value = position.coords.latitude;
    var elem = document.getElementById("o");
    elem.value = position.coords.longitude;
}

function codeAddress() {
    var address = document.getElementById('pac-input').value;
    geocoder.geocode({ 'address': address}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var elem = document.getElementById("a");
            elem.value = results[0].geometry.location.lat().toFixed(7);
            var elem = document.getElementById("o");
            elem.value = results[0].geometry.location.lng().toFixed(7);

            pos = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());

            map.setCenter(results[0].geometry.location);
            marker.setVisible(false);
            marker = new google.maps.Marker({
                draggable: true,
                position: pos,
                map: map,
                title: "Bạn ở đây?",
                raiseOnDrag: false,
                animation: google.maps.Animation.DROP
            });

            google.maps.event.addListener(marker, 'drag', function (a) {
                var elem = document.getElementById("a");
                elem.value = a.latLng.lat().toFixed(7);
                var elem = document.getElementById("o");
                elem.value = a.latLng.lng().toFixed(7);
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}
google.maps.event.addDomListener(window, 'load', initialize);

function show_cover(fileInput) {
    var files = fileInput.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var imageType = /image.*/;
        if (!file.type.match(imageType)) {
            continue;
        }
        var img = document.getElementById("thumbnil");
        img.file = file;
        var reader = new FileReader();
        reader.onload = (function (aImg) {
            return function (e) {
                aImg.src = e.target.result;
            };
        })(img);
        reader.readAsDataURL(file);
    }
}
function show_logo(fileInput) {
    var files = fileInput.files;
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var imageType = /image.*/;
        if (!file.type.match(imageType)) {
            continue;
        }
        var img = document.getElementById("thumbnil2");
        img.file = file;
        var reader = new FileReader();
        reader.onload = (function (aImg) {
            return function (e) {
                aImg.src = e.target.result;
            };
        })(img);
        reader.readAsDataURL(file);
    }
}