import { useEffect, useState } from "react";
import { resourceService } from "../../services/api";
import { formatResourceType, getResourceVisual } from "../../components/resource/resourceVisuals";
import ResourceDetailsModal from "../../components/resource/ResourceDetailsModal";
import "../../components/resource/resource-management.css";

var RESOURCE_TYPES = [
  "ALL",
  "LECTURE_HALL",
  "LAB",
  "SEMINAR_ROOM",
  "AUDITORIUM",
  "MEETING_ROOM",
  "STUDY_AREA",
  "EQUIPMENT"
];

function toSafeLower(value) {
  return String(value || "").trim().toLowerCase();
}

function toNumberOrNull(value) {
  if (value === "" || value == null) return null;
  var num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getCapacityTarget(minCapacity, maxCapacity) {
  var min = toNumberOrNull(minCapacity);
  var max = toNumberOrNull(maxCapacity);

  if (min != null && max != null) return (min + max) / 2;
  if (min != null) return min;
  if (max != null) return max;
  return null;
}

function getScoredRecommendations(resources, filters) {
  if (!Array.isArray(resources) || resources.length === 0) return [];

  var targetCapacity = getCapacityTarget(filters.minCapacity, filters.maxCapacity);
  var min = toNumberOrNull(filters.minCapacity);
  var max = toNumberOrNull(filters.maxCapacity);
  var searchText = toSafeLower(filters.search);
  var locationText = toSafeLower(filters.location);
  var typeFilter = String(filters.type || "ALL").toUpperCase();

  var scored = resources.map(function (resource) {
    var score = 0;
    var reasons = [];

    var type = String(resource.type || "").toUpperCase();
    var location = toSafeLower(resource.location || resource.hallId);
    var name = toSafeLower(resource.name);
    var desc = toSafeLower(resource.description);
    var capacity = Number(resource.capacity);
    var active = resource.status === "ACTIVE";

    if (typeFilter === "ALL" || type === typeFilter) {
      score += 20;
      if (typeFilter !== "ALL") reasons.push("Matches selected type");
    } else {
      score -= 30;
    }

    if (!locationText || location.indexOf(locationText) >= 0) {
      score += 15;
      if (locationText) reasons.push("Matches preferred location");
    } else {
      score -= 12;
    }

    if (!searchText || name.indexOf(searchText) >= 0 || location.indexOf(searchText) >= 0 || desc.indexOf(searchText) >= 0) {
      score += 10;
    } else {
      score -= 8;
    }

    if (Number.isFinite(capacity)) {
      if ((min == null || capacity >= min) && (max == null || capacity <= max)) {
        score += 20;
        if (min != null || max != null) reasons.push("Within your capacity range");
      }

      if (targetCapacity != null) {
        var diff = Math.abs(capacity - targetCapacity);
        var closeness = Math.max(0, 18 - Math.floor(diff / 5));
        score += closeness;
        if (closeness >= 12) reasons.push("Capacity is close to your target");
      }
    }

    if (active) {
      score += 12;
      reasons.push("Currently active and available for booking");
    } else {
      score -= 25;
    }

    return {
      resource: resource,
      score: score,
      reasons: reasons
    };
  });

  scored.sort(function (a, b) { return b.score - a.score; });
  return scored;
}

export default function Resources() {
  var stateResources = useState([]);
  var resources = stateResources[0];
  var setResources = stateResources[1];

  var stateFilter = useState("ALL");
  var filter = stateFilter[0];
  var setFilter = stateFilter[1];

  var stateSearch = useState("");
  var search = stateSearch[0];
  var setSearch = stateSearch[1];

  var stateLocation = useState("");
  var location = stateLocation[0];
  var setLocation = stateLocation[1];

  var stateMinCapacity = useState("");
  var minCapacity = stateMinCapacity[0];
  var setMinCapacity = stateMinCapacity[1];

  var stateMaxCapacity = useState("");
  var maxCapacity = stateMaxCapacity[0];
  var setMaxCapacity = stateMaxCapacity[1];

  var stateLoading = useState(false);
  var loading = stateLoading[0];
  var setLoading = stateLoading[1];

  var stateError = useState("");
  var error = stateError[0];
  var setError = stateError[1];

  var stateSelectedResource = useState(null);
  var selectedResource = stateSelectedResource[0];
  var setSelectedResource = stateSelectedResource[1];

  useEffect(function () {
    loadResources();
  }, [filter, search, location, minCapacity, maxCapacity]);

  async function loadResources() {
    setLoading(true);
    try {
      var data = await resourceService.getAll({
        type: filter,
        search: search.trim(),
        location: location.trim() || undefined,
        minCapacity: minCapacity === "" ? undefined : Number(minCapacity),
        maxCapacity: maxCapacity === "" ? undefined : Number(maxCapacity)
      });

      var list = Array.isArray(data) ? data : [];
      setResources(list);
      setError("");
    } catch (err) {
      setResources([]);
      setError(err.message || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }

  var scoredRecommendations = getScoredRecommendations(resources, {
    type: filter,
    search: search,
    location: location,
    minCapacity: minCapacity,
    maxCapacity: maxCapacity
  });
  var recommendation = scoredRecommendations.length > 0 ? scoredRecommendations[0] : null;
  var recommended = recommendation ? recommendation.resource : null;
  var recommendationReasons = recommendation ? recommendation.reasons.slice(0, 3) : [];
  var alternativeRecommendations = scoredRecommendations.slice(1, 4);

  return (
    <div className="page-content animate-in">
      <div className="content-header">
        <h1>Campus Resources</h1>
        <p>View available campus facilities and assets.</p>
      </div>

      <div className="filter-bar glass-card">
        <div className="filter-search">
          <span className="form-input-icon">Search</span>
          <input
            type="text"
            placeholder="Search by name, location, or description"
            value={search}
            onChange={function (e) { setSearch(e.target.value); }}
            className="form-input"
          />
        </div>

        <div className="filter-search">
          <span className="form-input-icon">Location</span>
          <input
            type="text"
            placeholder="Filter by location or hall ID"
            value={location}
            onChange={function (e) { setLocation(e.target.value); }}
            className="form-input"
          />
        </div>

        <div className="form-row" style={{ marginTop: 8 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Min Capacity</label>
            <div className="form-input-wrapper">
              <input
                type="number"
                min="1"
                className="form-input"
                value={minCapacity}
                onChange={function (e) { setMinCapacity(e.target.value); }}
                placeholder="Any"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Max Capacity</label>
            <div className="form-input-wrapper">
              <input
                type="number"
                min="1"
                className="form-input"
                value={maxCapacity}
                onChange={function (e) { setMaxCapacity(e.target.value); }}
                placeholder="Any"
              />
            </div>
          </div>
        </div>

        <div className="filter-chips">
          {RESOURCE_TYPES.map(function (type) {
            return (
              <button
                key={type}
                className={"filter-chip " + (filter === type ? "filter-chip--active" : "")}
                onClick={function () { setFilter(type); }}
              >
                {type === "ALL" ? "All" : type.split("_").join(" ")}
              </button>
            );
          })}
        </div>
      </div>

      {error ? (
        <div className="glass-card" style={{ marginBottom: 16, color: "#F87171" }}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="glass-card" style={{ padding: 20 }}>Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="glass-card" style={{ padding: 20 }}>No resources found.</div>
      ) : (
        <>
          {recommended ? (
            <div className="glass-card" style={{ marginBottom: 16, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Smart Recommendation
                  </div>
                  <h3 style={{ margin: "4px 0 6px" }}>{recommended.name}</h3>
                  <p style={{ margin: 0, fontSize: "0.82rem" }}>
                    Best match based on your current filters (score: {recommendation.score})
                  </p>
                </div>
                <button
                  className="btn-secondary"
                  style={{ width: "auto", height: "fit-content" }}
                  onClick={function () { setSelectedResource(recommended); }}
                >
                  View details
                </button>
              </div>

              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {recommendationReasons.map(function (reason) {
                  return (
                    <span
                      key={reason}
                      className="filter-chip filter-chip--active"
                      style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.72rem" }}
                    >
                      {reason}
                    </span>
                  );
                })}
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                  Why this recommendation?
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span className="filter-chip" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.72rem" }}>
                    Type match: +20
                  </span>
                  <span className="filter-chip" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.72rem" }}>
                    Location match: +15
                  </span>
                  <span className="filter-chip" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.72rem" }}>
                    Capacity range/fit: up to +38
                  </span>
                  <span className="filter-chip" style={{ textTransform: "none", letterSpacing: 0, fontSize: "0.72rem" }}>
                    Active status bonus: +12
                  </span>
                </div>
              </div>

              {alternativeRecommendations.length > 0 ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                    Top Alternatives
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {alternativeRecommendations.map(function (item) {
                      return (
                        <div
                          key={item.resource.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                            border: "1px solid var(--border)",
                            borderRadius: "10px",
                            padding: "8px 10px"
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.86rem" }}>{item.resource.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {formatResourceType(item.resource.type)} • Capacity {item.resource.capacity || "-"}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="filter-chip filter-chip--active" style={{ fontSize: "0.7rem", padding: "3px 8px" }}>
                              Score {item.score}
                            </span>
                            <button
                              className="btn-secondary"
                              style={{ width: "auto", padding: "6px 10px" }}
                              onClick={function () { setSelectedResource(item.resource); }}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rm-card-grid">
            {resources.map(function (resource) {
            var visual = getResourceVisual(resource.type);
            var active = resource.status === "ACTIVE";
            var hoursText = (resource.availableFrom || "--:--") + " - " + (resource.availableTo || "--:--");

            return (
              <div
                className="glass-card rm-resource-card"
                key={resource.id}
                onClick={function () { setSelectedResource(resource); }}
                style={{
                  cursor: "pointer"
                }}
              >
                <div className="rm-resource-image-wrap">
                  <img src={visual.image} alt={visual.label} className="rm-resource-image" />
                  <span className="rm-resource-icon-badge">{visual.icon}</span>
                  <span className={"rm-status-pill " + (active ? "rm-status-pill--active" : "rm-status-pill--out")}>
                    {active ? "Active" : "Out of Service"}
                  </span>
                </div>

                <div className="rm-resource-body">
                  <h3 style={{ margin: 0 }}>{resource.name}</h3>
                  <div className="rm-resource-type">{formatResourceType(resource.type)}</div>
                  <p className="rm-resource-desc">{resource.description || "No description available."}</p>

                  <div className="rm-resource-meta">
                    <span>Location: {resource.location || "-"}</span>
                    <span>Capacity: {resource.capacity || "-"}</span>
                  </div>

                  <div className="rm-resource-meta" style={{ marginTop: -6, marginBottom: 4 }}>
                    <span>Available Hours: {hoursText}</span>
                  </div>

                  <div className="rm-resource-meta" style={{ marginTop: -6, marginBottom: 0 }}>
                    <span>Hall ID: {resource.hallId || resource.location || "-"}</span>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </>
      )}

      <ResourceDetailsModal
        resource={selectedResource}
        onClose={function () { setSelectedResource(null); }}
      />
    </div>
  );
}