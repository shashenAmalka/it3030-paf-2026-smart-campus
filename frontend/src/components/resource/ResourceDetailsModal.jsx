import { useState } from "react";
import { formatResourceType, getResourceVisual } from "./resourceVisuals";
import ResourceLocationMap from "./ResourceLocationMap";

function formatFacility(value) {
  return String(value || "").split("_").join(" ");
}

export default function ResourceDetailsModal({ resource, onClose }) {
  if (!resource) return null;

  var stateShowLiveLocation = useState(false);
  var showLiveLocation = stateShowLiveLocation[0];
  var setShowLiveLocation = stateShowLiveLocation[1];

  var visual = getResourceVisual(resource.type);
  var active = resource.status === "ACTIVE";
  var hoursText = (resource.availableFrom || "--:--") + " - " + (resource.availableTo || "--:--");
  var facilities = Array.isArray(resource.facilities) ? resource.facilities : [];
  var hasMapLocation = resource.latitude != null && resource.longitude != null;

  var directionsUrl = hasMapLocation
    ? "https://www.google.com/maps/dir/?api=1&destination=" + resource.latitude + "," + resource.longitude + "&travelmode=walking"
    : "";

  return (
    <div className="rm-modal-overlay" onClick={onClose}>
      <div className="glass-card rm-modal-card" onClick={function (e) { e.stopPropagation(); }}>
        <div className="rm-modal-header-image">
          <img src={visual.image} alt={visual.label} className="rm-modal-image" />
          <span className={"rm-status-pill " + (active ? "rm-status-pill--active" : "rm-status-pill--out")}>
            {active ? "Active" : "Out of Service"}
          </span>
        </div>

        <div className="rm-modal-body">
          <h3 style={{ margin: 0 }}>{resource.name}</h3>
          <div className="rm-resource-type">{formatResourceType(resource.type)}</div>

          <p style={{ marginTop: 8, marginBottom: 10 }}>
            {resource.description || "No description available."}
          </p>

          <div className="rm-resource-meta">
            <span>Building: {resource.buildingName || "-"}</span>
            <span>Block: {resource.block || "-"}</span>
          </div>
          <div className="rm-resource-meta">
            <span>Floor: {resource.floor != null ? resource.floor : "-"}</span>
            <span>Hall No: {resource.hallNumber != null ? resource.hallNumber : "-"}</span>
          </div>
          <div className="rm-resource-meta">
            <span>Hall ID: {resource.hallId || resource.location || "-"}</span>
            <span>Capacity: {resource.capacity || "-"}</span>
          </div>
          <div className="rm-resource-meta">
            <span>Available Hours: {hoursText}</span>
          </div>
          <div className="rm-resource-meta">
            <span>Facilities: {facilities.length > 0 ? facilities.map(formatFacility).join(", ") : "-"}</span>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>
              Facilities
            </div>
            <div className="rm-facility-grid">
              {facilities.length === 0 ? (
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No facilities listed</span>
              ) : facilities.map(function (f) {
                return (
                  <span key={f} className="rm-facility-chip rm-facility-chip--active">
                    {formatFacility(f)}
                  </span>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>
              Location Map
            </div>

            {hasMapLocation ? (
              <>
                <ResourceLocationMap
                  latitude={resource.latitude}
                  longitude={resource.longitude}
                  interactive={false}
                  showUserLocation={showLiveLocation}
                  height={260}
                />

                <div className="rm-location-coordinates">
                  Resource Coordinates: {resource.latitude}, {resource.longitude}
                </div>

                <div className="rm-form-actions" style={{ marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: "auto" }}
                    onClick={function () { setShowLiveLocation(!showLiveLocation); }}
                  >
                    {showLiveLocation ? "Hide My Live Location" : "Show My Live Location"}
                  </button>
                  <a className="btn-primary" style={{ width: "auto" }} href={directionsUrl} target="_blank" rel="noreferrer">
                    Open Directions
                  </a>
                </div>
              </>
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>
                No map location has been set for this resource yet.
              </div>
            )}
          </div>

          <button className="btn-secondary" style={{ marginTop: 14 }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
