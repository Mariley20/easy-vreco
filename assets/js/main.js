'use strict'
const aplicacion = {
    mapa: undefined,
    latitud: undefined,
    longitud: undefined,
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
        let autocompletaOrigen = new google.maps.places.Autocomplete(lugarOrigen);
        autocompletaOrigen.bindTo('bounds', aplicacion.mapa);
        let detalleUbicacionOrigen = new google.maps.InfoWindow();
        let marcarOrigen = aplicacion.crearMarcador(aplicacion.mapa);

        aplicacion.crearListener(autocompletaOrigen, detalleUbicacionOrigen, marcarOrigen);

        let lugarDestino = document.getElementById('destino');
        let autocompletaDestino = new google.maps.places.Autocomplete(lugarDestino);
        autocompletaDestino.bindTo('bounds', aplicacion.mapa);
        let detalleUbicacionDestino = new google.maps.InfoWindow();
        let marcarDestino = aplicacion.crearMarcador(aplicacion.mapa);

        aplicacion.crearListener(autocompletaDestino, detalleUbicacionDestino, marcarDestino);

        /* Mi ubicación actual */
        $("#encuentrame").click(aplicacion.buscarMiUbicacion);
        /* Ruta */
        let servicioDireccion = new google.maps.DirectionsService;
        let visualizaDireccion = new google.maps.DirectionsRenderer;

        $("#ruta").on("click", () => {
            aplicacion.dibujarRuta(servicioDireccion, visualizaDireccion);
        });

        visualizaDireccion.setMap(aplicacion.mapa);
    },
    crearListener: (autocomplete, detalleUbicacion, marcar) => {
        autocomplete.addListener('place_changed', () => {
            detalleUbicacion.close();
            marcar.setVisible(false);
            let lugar = autocomplete.getPlace();
            aplicacion.marcarUbicacion(lugar, detalleUbicacion, marcar);
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
    marcarUbicacion: (lugar, detalleUbicacion, marcar) => {
        if (!lugar.geometry) {
            // Error si no encuentra el lugar indicado
            window.alert("No encontramos el lugar que indicaste: '" + lugar.name + "'");
            return;
        }
        // If the lugar has a geometry, then present it on a aplicacion.map.
        if (lugar.geometry.viewport) {
            aplicacion.mapa.fitBounds(lugar.geometry.viewport);
        } else {
            aplicacion.mapa.setCenter(lugar.geometry.location);
            aplicacion.mapa.setZoom(17);
        }

        marcar.setPosition(lugar.geometry.location);
        marcar.setVisible(true);

        let address = '';
        if (lugar.address_components) {
            address = [
                (lugar.address_components[0] && lugar.address_components[0].short_name || ''),
                (lugar.address_components[1] && lugar.address_components[1].short_name || ''),
                (lugar.address_components[2] && lugar.address_components[2].short_name || '')
            ].join(' ');
        }

        detalleUbicacion.setContent('<div><strong>' + lugar.name + '</strong><br>' + address);
        detalleUbicacion.open(aplicacion.mapa, marcar);
    },
    crearMarcador: (map) => {
        let icono = {
            url: 'http://icons.iconarchive.com/icons/sonya/swarm/128/Bike-icon.png',
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        };

        let marca = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            icon: icono,
            anchorPoint: new google.maps.Point(0, -29)
        });

        return marca;
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