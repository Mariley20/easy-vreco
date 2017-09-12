'use strict'
const aplicacion = {
    mapa: undefined,
    latitud: undefined,
    longitud:undefined,
    //lugarOrigen: undefined,
    //lugarDestino: undefined,
    inicio: () => {
        aplicacion.mapa = new google.maps.Map(document.getElementById("map"), {
            zoom: 10,
            center: {
                lat: -16.404054478065266,
                lng: -71.53901144999998
            },
            mapTypeControl: false,
            zoomControl: false,
            streetViewControl: false
        });

        let lugarOrigen = document.getElementById('origen');
        let autocompleteOrigen = new google.maps.places.Autocomplete(lugarOrigen);
        autocompleteOrigen.bindTo('bounds', aplicacion.mapa);
        let detalleUbicacionOrigen = new google.maps.InfoWindow();
        let markerOrigen = aplicacion.crearMarcador(aplicacion.mapa);

        aplicacion.crearListener(autocompleteOrigen, detalleUbicacionOrigen, markerOrigen);

        let lugarDestino = document.getElementById('destino');
        let autocompletaDestino = new google.maps.places.Autocomplete(lugarDestino);
        autocompletaDestino.bindTo('bounds', aplicacion.mapa);
        let detalleUbicacionDestino = new google.maps.InfoWindow();
        let marcarDestino = aplicacion.crearMarcador(aplicacion.mapa);

        aplicacion.crearListener(autocompletaDestino, detalleUbicacionDestino, marcarDestino);

        /* Mi ubicación actual */
        $("#encuentrame").click(aplicacion.buscarMiUbicacion);
        /* Ruta */
        let directionsService = new google.maps.DirectionsService;
        let directionsDisplay = new google.maps.DirectionsRenderer;

        $("#ruta").on("click", () => {
            aplicacion.dibujarRuta(directionsService, directionsDisplay);
        });

        directionsDisplay.setMap(aplicacion.mapa);
    },
    crearListener: (autocomplete, detalleUbicacion, marker) => {
        autocomplete.addListener('place_changed', () => {
            detalleUbicacion.close();
            marker.setVisible(false);
            let place = autocomplete.getPlace();
            aplicacion.marcarUbicacion(place, detalleUbicacion, marker);
        });
    },
    buscarMiUbicacion: () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(aplicacion.marcarUbicacionAutomatica, aplicacion.funcionError);
        }
    },
    funcionError: (error) => {
        alert("Tenemos un problema para encontrar tu ubicación");
    },
    marcarUbicacionAutomatica: (posicion) => {
        aplicacion.latitud = posicion.coords.latitude;
        aplicacion.longitud = posicion.coords.longitude;

        let ubicacionActual = new google.maps.Marker({
            position: {
                lat: aplicacion.latitud,
                lng: aplicacion.longitud
            },
            animation: google.maps.Animation.DROP,
            map: aplicacion.mapa
        });
        aplicacion.mapa.setZoom(17);
        aplicacion.mapa.setCenter(ubicacionActual.position);
    },
    marcarUbicacion: (place, detalleUbicacion, marker) => {
        if (!place.geometry) {
            // Error si no encuentra el lugar indicado
            window.alert("No encontramos el lugar que indicaste: '" + place.name + "'");
            return;
        }
        // If the place has a geometry, then present it on a aplicacion.map.
        if (place.geometry.viewport) {
            aplicacion.mapa.fitBounds(place.geometry.viewport);
        } else {
            aplicacion.mapa.setCenter(place.geometry.location);
            aplicacion.mapa.setZoom(17);
        }

        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        let address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        detalleUbicacion.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        detalleUbicacion.open(aplicacion.mapa, marker);
    },
    crearMarcador: (map) => {
        let icono = {
            url: 'http://icons.iconarchive.com/icons/sonya/swarm/128/Bike-icon.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };

        let marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            icon: icono,
            anchorPoint: new google.maps.Point(0, -29)
        });

        return marker;
    },
    dibujarRuta: (directionsService, directionsDisplay) => {
        let origin = $("#origen").val();
        let destination = $('#destino').val();

        if (destination != "" && destination != "") {
            directionsService.route({
                    origin: origin,
                    destination: destination,
                    travelMode: "DRIVING"
                },
                (response, status) => {
                    if (status === "OK") {
                        directionsDisplay.setDirections(response);
                    } else {
                        aplicacion.funcionErrorRuta();
                    }
                });
        }
    },
    funcionErrorRuta: () => {
        alert("No ingresaste un origen y un destino validos");
    }

}

function initMap() {
    aplicacion.inicio();
}