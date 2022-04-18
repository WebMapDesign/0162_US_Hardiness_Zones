const colorsHardinessScale = {
  "1a": "#d6d6ff",
  "1b": "#c4c4f2",
  "2a": "#ababd9",
  "2b": "#ebb0eb",
  "3a": "#e091eb",
  "3b": "#cf7ddb",
  "4a": "#a66bff",
  "4b": "#5a75ed",
  "5a": "#73a1ff",
  "5b": "#5ec9e0",
  "6a": "#47ba47",
  "6b": "#78c756",
  "7a": "#abd669",
  "7b": "#cddb70",
  "8a": "#edda85",
  "8b": "#ebcb57",
  "9a": "#dbb64f",
  "9b": "#f5b678",
  "10a": "#eb9c36",
  "10b": "#e6781e",
  "11a": "#e6561e",
  "11b": "#e88564",
  "12a": "#d4594e",
  "12b": "#b51228",
  "13a": "#962f1d",
  "13b": "#751502",
};

const crs2163 = new L.Proj.CRS(
  "EPSG:2163",
  "+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 +a=6370997 +b=6370997 +units=m +no_defs",
  {
    origin: [0, 0],
    resolutions: [5500],
  }
);

const crs5070 = new L.Proj.CRS(
  "EPSG:5070",
  "+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  {
    origin: [0, 0],
    resolutions: [5500],
  }
);

const crs3338 = new L.Proj.CRS(
  "EPSG:3338",
  "+proj=aea +lat_1=55 +lat_2=65 +lat_0=50 +lon_0=-154 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  {
    origin: [0, 0],
    resolutions: [12000],
  }
);

const crs102114 = new L.Proj.CRS(
  "EPSG:102114",
  "+proj=utm +zone=4 +ellps=clrk66 +units=m +no_defs",
  {
    origin: [0, 0],
    resolutions: [3000],
  }
);

const disableMapControls = {
  doubleClickZoom: false,
  // dragging: false,
  boxZoom: false,
  zoomControl: false,
  attributionControl: false,
};

let map = L.map("map", {
  ...disableMapControls,
  crs: crs5070,
}).setView([39.0, -98.0], 0);

let mapAlaska = L.map("map-Alaska", {
  ...disableMapControls,
  crs: crs3338,
}).setView([62.0, -153.0], 0);

let mapHawaii = L.map("map-Hawaii", {
  ...disableMapControls,
  crs: crs102114,
}).setView([20.8, -157.1], 0);

let sidebarResults = L.control.sidebar("div-sidebar-info", {
  position: "right",
  closeButton: true,
  autoPan: false,
});

map.addControl(sidebarResults);
// sidebarResults.show();

let styleStates = {
  color: "#ffffff",
  fillColor: "#ffffff",
  fillOpacity: 0,
  opacity: 1,
  weight: 1.5,
};

let layerStates;
let layerStatesAlaska;
let layerStatesHawaii;

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    color: "#ffffff",
    fillColor: "#ffffff",
    fillOpacity: 0.2,
    opacity: 1,
    weight: 2,
  });
}

function resetHighlight(e) {
  layerStates.resetStyle(e.target);
}

function onEachFeatureStates(feature, layer) {
  let tooltipContent = feature.properties.name;
  layer.bindTooltip(tooltipContent, {
    direction: "center",
    className: "tooltip-style",
  });

  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: showStateInfo,
  });
}

layerStates = L.Proj.geoJson(geojsonStatesZones, {
  style: styleStates,
  onEachFeature: onEachFeatureStates,
}).addTo(map);

layerStatesAlaska = L.Proj.geoJson(geojsonStateAlaska, {
  style: styleStates,
  onEachFeature: onEachFeatureStates,
}).addTo(mapAlaska);

layerStatesHawaii = L.Proj.geoJson(geojsonStateHawaii, {
  style: styleStates,
  onEachFeature: onEachFeatureStates,
}).addTo(mapHawaii);

// ---------------STATE INFO ------------
const stateName = document.querySelector("#state-name");
const stateScale = document.querySelector("#state-scale");

let sidebarStatus = "closed";

function showStateInfo(e) {
  sidebarResults.show(); // sidebar opens

  stateScale.innerHTML = ""; //empty

  stateName.innerText =
    e.target.feature.properties.name.toUpperCase() +
    " (" +
    e.target.feature.properties.abbrev +
    ")";

  let listStateZones = e.target.feature.properties.zones
    .replaceAll("'", "")
    .split(",");

  listStateZones.forEach((zone) => {
    stateScale.innerHTML += `<i class="sidepanel" style="background: ${colorsHardinessScale[zone]}"></i>`;
  });
}

sidebarResults.on("shown", function () {
  sidebarStatus = "opened";
});

sidebarResults.on("hidden", function () {
  sidebarStatus = "closed";
});

map.on("click", function (e) {
  if (sidebarStatus === "opened") {
    sidebarResults.hide(); // sidebar opens
  }
});

// ---------------LEGEND ---------------
let legendZones = L.control({ position: "topleft" });

legendZones.onAdd = function (map) {
  let div = L.DomUtil.create("div", "info legend legend-sales");

  for (const zone in colorsHardinessScale) {
    div.innerHTML += `<i style="background: ${colorsHardinessScale[zone]}"></i>${zone}<br>`;
  }
  return div;
};

legendZones.addTo(map);

// ---------------SEARCH BAR ---------------
const inputZipCode = document.querySelector("#zip-code-input");
const outputHardinessZone = document.querySelector("#hardiness-zone-output");

inputZipCode.addEventListener("input", function () {
  let inputSearchValue = inputZipCode.value;

  if (inputSearchValue.length === 5) {
    let filterResult = valuesHardinessZipCodes.filter(
      (x) => x["zip"] == inputSearchValue
    );
    if (filterResult.length > 0) {
      outputHardinessZone.textContent =
        "Hardiness: Zone " + filterResult[0]["zone"];
    } else {
      outputHardinessZone.textContent = "Not found";
    }
  } else {
    outputHardinessZone.textContent = "Enter a 5-digit zip code";
  }
});

// ---------------RASTER HARDINESS ---------------
let rasterUrl = "raster/raster_ophz.png";

let imageBounds = [
  [23.08, -127.9],
  [47.95, -74.2],
];

const optionsImageOverlay = {
  opacity: 1,
};

let layerRasterHardinessZones = L.imageOverlay(
  rasterUrl,
  imageBounds,
  optionsImageOverlay
).addTo(map);
