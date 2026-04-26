import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

var DEFAULT_CENTER = [6.9147, 79.9729];
var DEFAULT_ZOOM = 16;
var FOCUSED_ZOOM = 18;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

function parseCoordinate(value) {
  if (value === "" || value == null) return null;
  var numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function ensureUserMarker(map, markerRef, point) {
  if (!map || !point) return;

  if (!markerRef.current) {
    markerRef.current = L.circleMarker([point.latitude, point.longitude], {
      radius: 8,
      color: "#1d4ed8",
      fillColor: "#60a5fa",
      fillOpacity: 0.85,
      weight: 2
    }).addTo(map);
    return;
  }

  markerRef.current.setLatLng([point.latitude, point.longitude]);
}

export default function ResourceLocationMap({
  latitude,
  longitude,
  onPick,
  interactive,
  showUserLocation,
  height
}) {
  var mapContainerRef = useRef(null);
  var mapRef = useRef(null);
  var resourceMarkerRef = useRef(null);
  var userMarkerRef = useRef(null);
  var onPickRef = useRef(onPick);
  var stateUserPosition = useState(null);
  var userPosition = stateUserPosition[0];
  var setUserPosition = stateUserPosition[1];
  var stateGeoError = useState("");
  var geoError = stateGeoError[0];
  var setGeoError = stateGeoError[1];

  var lat = parseCoordinate(latitude);
  var lng = parseCoordinate(longitude);

  useEffect(function () {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(function () {
    if (!mapContainerRef.current || mapRef.current) return;

    var map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    if (interactive) {
      map.on("click", function (event) {
        var pickedLat = Number(event.latlng.lat.toFixed(6));
        var pickedLng = Number(event.latlng.lng.toFixed(6));
        if (onPickRef.current) {
          onPickRef.current({ latitude: pickedLat, longitude: pickedLng });
        }
      });
    }

    mapRef.current = map;

    map.whenReady(function () {
      map.invalidateSize(false);
    });

    return function () {
      map.stop();
      map.off();
      map.remove();
      mapRef.current = null;
      resourceMarkerRef.current = null;
      userMarkerRef.current = null;
    };
  }, [interactive]);

  useEffect(function () {
    var map = mapRef.current;
    if (!map) return;

    if (lat == null || lng == null) {
      if (resourceMarkerRef.current) {
        map.removeLayer(resourceMarkerRef.current);
        resourceMarkerRef.current = null;
      }
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: false });
      return;
    }

    if (!resourceMarkerRef.current) {
      resourceMarkerRef.current = L.marker([lat, lng]).addTo(map);
    } else {
      resourceMarkerRef.current.setLatLng([lat, lng]);
    }

    map.setView([lat, lng], FOCUSED_ZOOM, { animate: false });
  }, [lat, lng]);

  useEffect(function () {
    if (!showUserLocation || typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError(showUserLocation ? "Geolocation is not supported on this browser." : "");
      return;
    }

    setGeoError("");
    var watchId = navigator.geolocation.watchPosition(
      function (position) {
        setUserPosition({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6))
        });
      },
      function (error) {
        if (error && error.message) {
          setGeoError(error.message);
        } else {
          setGeoError("Unable to read your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );

    return function () {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [showUserLocation]);

  useEffect(function () {
    var map = mapRef.current;

    if (!map || !showUserLocation || !userPosition) {
      if (map && userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      return;
    }

    ensureUserMarker(map, userMarkerRef, userPosition);
  }, [showUserLocation, userPosition]);

  return (
    <div>
      <div
        ref={mapContainerRef}
        className={"rm-location-map " + (interactive ? "rm-location-map--interactive" : "")}
        style={{ height: height || 280 }}
      />
      {geoError ? (
        <div className="rm-inline-error" style={{ marginTop: 6 }}>{geoError}</div>
      ) : null}
    </div>
  );
}
