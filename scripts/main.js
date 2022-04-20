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

// EPSG:5070 Contiguous US
const crs5070 = new L.Proj.CRS(
  "EPSG:5070",
  "+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-96 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  {
    origin: [0, 0],
    resolutions: [5500],
  }
);

// EPSG:3338 Alaska
const crs3338 = new L.Proj.CRS(
  "EPSG:3338",
  "+proj=aea +lat_1=55 +lat_2=65 +lat_0=50 +lon_0=-154 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  {
    origin: [0, 0],
    resolutions: [12000],
  }
);

// EPSG:102114 Hawaii
const crs102114 = new L.Proj.CRS(
  "EPSG:102114",
  "+proj=utm +zone=4 +ellps=clrk66 +units=m +no_defs",
  {
    origin: [0, 0],
    resolutions: [3500],
  }
);

const disabledMapControls = {
  attributionControl: false,
  boxZoom: false,
  doubleClickZoom: false,
  dragging: false,
  zoomControl: false,
};

let map = L.map("map", {
  ...disabledMapControls,
  crs: crs5070,
}).setView([36.0, -98.0], 0);

let mapAlaska = L.map("map-Alaska", {
  ...disabledMapControls,
  crs: crs3338,
}).setView([62.5, -153.0], 0);

let mapHawaii = L.map("map-Hawaii", {
  ...disabledMapControls,
  crs: crs102114,
}).setView([20.5, -157.3], 0);

let sidebarResults = L.control.sidebar("div-sidebar-info", {
  position: "right",
  closeButton: true,
  autoPan: false,
});

map.addControl(sidebarResults);

let styleStates = {
  color: "#ffffff",
  fillColor: "#ffffff",
  fillOpacity: 0,
  opacity: 1,
  weight: 1,
};

let styleStatesOther = {
  color: "#ffffff",
  fillColor: "#ffffff",
  fillOpacity: 0,
  opacity: 1,
  weight: 0,
};

let styleHidden = {
  color: "#ffffff",
  fillColor: "#ffffff",
  fillOpacity: 0,
  opacity: 0,
  weight: 1,
};

let styleFilterHideContiguous = {
  color: "#ffffff",
  fillColor: "#ffffff",
  fillOpacity: 0.5,
  opacity: 1,
  weight: 1,
};

let styleFilterHideOther = {
  color: "#ffffff",
  fillColor: "#ffffff",
  fillOpacity: 0.5,
  opacity: 1,
  weight: 0,
};

let layerStatesContiguous;
let layerStatesAlaska;
let layerStatesHawaii;

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    fillColor: "#000000",
    fillOpacity: 0.2,
    opacity: 1,
  });
}

function resetHighlightContiguous(e) {
  layerStatesContiguous.resetStyle(e.target);
}

function resetHighlightAK(e) {
  layerStatesAlaska.resetStyle(e.target);
}

function resetHighlightHI(e) {
  layerStatesHawaii.resetStyle(e.target);
}

function onEachFeatureStatesContiguous(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlightContiguous,
    click: showStateInfo,
  });
}

function onEachFeatureOpacity(feature, layer) {
  layer.on({
    click: hideStateInfo,
  });
}

function onEachFeatureStatesAK(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlightAK,
    click: showStateInfo,
  });
}

function onEachFeatureStatesHI(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlightHI,
    click: showStateInfo,
  });
}

function onEachFeatureHidden(feature, layer) {
  layer.on({
    click: hideStateInfo,
  });
}

layerStatesContiguous = L.Proj.geoJson(geojsonStatesZones, {
  style: styleStates,
  onEachFeature: onEachFeatureStatesContiguous,
}).addTo(map);

layerStatesAlaska = L.Proj.geoJson(geojsonStateAlaska, {
  style: styleStatesOther,
  onEachFeature: onEachFeatureStatesAK,
}).addTo(mapAlaska);

layerStatesHawaii = L.Proj.geoJson(geojsonStateHawaii, {
  style: styleStatesOther,
  onEachFeature: onEachFeatureStatesHI,
}).addTo(mapHawaii);

layerOpacityContiguous = L.Proj.geoJson(geojsonStatesZones, {
  style: styleFilterHideContiguous,
  onEachFeature: onEachFeatureOpacity,
});

layerOpacityAlaska = L.Proj.geoJson(geojsonStateAlaska, {
  style: styleFilterHideOther,
  onEachFeature: onEachFeatureOpacity,
});

layerOpacityHawaii = L.Proj.geoJson(geojsonStateHawaii, {
  style: styleFilterHideOther,
  onEachFeature: onEachFeatureOpacity,
});

let layerDifference = L.Proj.geoJson(geojsonDifference, {
  style: styleHidden,
  onEachFeature: onEachFeatureHidden,
}).addTo(map);

// ---------------STATE INFO ------------
const stateName = document.querySelector("#state-name");
const climateDescription = document.querySelector("#climate-description");
const nameStateTree = document.querySelector("#name-tree");
const treeImage = document.querySelector("#tree-image");
const treesToPlant = document.querySelector("#trees-to-plant");

const stateScale = document.querySelector("#state-scale");
const containerStateZoom = document.querySelector("#div-state-zoom");

// at map initialization the sidebar is closed
let sidebarStatus = "closed";

function showStateInfo(e) {
  layerOpacityContiguous.addTo(map);
  layerOpacityAlaska.addTo(mapAlaska);
  layerOpacityHawaii.addTo(mapHawaii);

  // sidebar opens
  sidebarResults.show();

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
    stateScale.innerHTML += `<i class="sidepanel" style="background: ${colorsHardinessScale[zone]}">${zone}</i>`;
  });

  climateDescription.innerText = stateInformation.filter(
    (i) => i["state_name"] === e.target.feature.properties.name
  )[0]["climate_description"];

  nameStateTree.innerText = stateInformation.filter(
    (i) => i["state_name"] === e.target.feature.properties.name
  )[0]["tree_name"];

  let demoStates = ["AZ", "CO", "MT", "UT", "WY"];
  if (demoStates.includes(e.target.feature.properties.abbrev)) {
    treeImage.src =
      "images/state_trees/tree_" + e.target.feature.properties.abbrev + ".png";
  }

  treesToPlant.href = stateInformation.filter(
    (i) => i["state_name"] === e.target.feature.properties.name
  )[0]["trees_plant_url"];
  treesToPlant.innerText =
    "Trees to plant in " + e.target.feature.properties.name;

  containerStateZoom.style.display = "block";
  containerStateZoom.innerHTML = "";

  containerStateZoom.innerHTML =
    '<img class="state-clipped" alt="state hardiness map" src="./images/state_zones/zones_' +
    e.target.feature.properties.abbrev +
    '.png">';
}

function hideStateInfo(e) {

  // the layers used to induce opacity are removed
  if (map.hasLayer(layerOpacityContiguous)) {
    map.removeLayer(layerOpacityContiguous);
  }

  if (mapAlaska.hasLayer(layerOpacityAlaska)) {
    mapAlaska.removeLayer(layerOpacityAlaska);
  }

  if (mapHawaii.hasLayer(layerOpacityHawaii)) {
    mapHawaii.removeLayer(layerOpacityHawaii);
  }

  // sidebar closes
  if (sidebarStatus === "opened") {
    sidebarResults.hide();
  }

  // state zoom closes
  if (containerStateZoom.style.display === "block") {
    containerStateZoom.style.display = "none";
  }

  treeImage.src = "images/state_trees/test_img.png";
}

sidebarResults.on("shown", function () {
  sidebarStatus = "opened";
});

sidebarResults.on("hidden", function () {
  sidebarStatus = "closed";
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

// ---------------IMAGE OVERLAY RASTER HARDINESS---------------
let urlRasterContiguous = "images/raster/img_contiguous.png";
let urlRasterAK = "images/raster/img_AK.png";
let urlRasterHI = "images/raster/img_HI.png";

let boundsRasterContiguous = [
  [23.08, -127.9],
  [47.95, -74.2],
];

let boundsRasterAK = [
  [49.1, 175.7],
  [67.6, -117.5],
];

let boundsRasterHI = [
  [18.9, -160.28],
  [22.25, -154.8],
];

const optionsImageOverlay = {
  opacity: 1,
};

let layerRasterHardinessZonesCON = L.imageOverlay(
  urlRasterContiguous,
  boundsRasterContiguous,
  optionsImageOverlay
).addTo(map);

let layerRasterHardinessZonesAK = L.imageOverlay(
  urlRasterAK,
  boundsRasterAK,
  optionsImageOverlay
).addTo(mapAlaska);

let layerRasterHardinessZonesHI = L.imageOverlay(
  urlRasterHI,
  boundsRasterHI,
  optionsImageOverlay
).addTo(mapHawaii);
