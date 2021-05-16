<template>
    <div id="mapid">
        <l-map
            ref="map"
            :min-zoom="minZoom"
            :crs="crs"
            @click="addMarker"
            style="z-index: 0;"
        >
        <l-image-overlay
            :url="url"
            :bounds="bounds"
        />
        <l-marker
            v-for="marker in markers"
            :key="marker.label"
            :lat-lng="marker"
            :ref="'marker-' + marker.label"
            :draggable="true"
            @dragstart="dragStartHandler"
            @dragend="dragEndHandler"
            @click="onClickMarkerHandler(marker)"
        >
            <l-tooltip :options="tooltipOptions">{{marker.label}}</l-tooltip>
            <!-- <l-popup :content="marker.label" :options="popupOptions" /> -->
        </l-marker>
        <l-polyline 
            v-for="(line) in lineSegments"
            :key="line.pt1 + '-' + line.pt2"
            :lat-lngs="line.coord" 
            @click="onClickPolyLine" 
        />
        </l-map>
    </div>
</template>

<script>
    import { Icon } from 'leaflet';

    delete Icon.Default.prototype._getIconUrl;
    Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
    import L from 'leaflet';
    //import { CRS } from "leaflet";
    import { LMap, LImageOverlay, LMarker, LPolyline, LTooltip } from "vue2-leaflet";

    export default {
        components: {
            LMap,
            LImageOverlay,
            LMarker,
            LPolyline,
            LTooltip
        },
        props: {
            additionMode: String
        },
        watch: {
            markers: {
                deep: true,
                handler() {
                    console.log("Oh Hello");
                    // this.$nextTick(() => {
                    //     this.$refs["marker"][this.markers.length-1]["mapObject"].openPopup();
                    // });
                }
            },
            additionMode: {
                deep: true,
                handler(val) {
                    console.log(val);
                    if(val === "lineAdd") {
                        this.activeMarker = {};
                        let passArgs = [{}];
                        this.$emit("activate-toolbar", passArgs);
                    }
                    return val;
                }
            }
        },
        data: () => ({
            url: require("./doushishaRyokanBldg.jpg"),
            bounds: [[0, 0], [700, 1200]],
            minZoom: -1,
            activeMode: "",
            crs: L.Util.extend(L.CRS.Simple, {
                    transformation: new L.Transformation(1,0,1,0)
                }),
            popupOptions: {
                // closeButton: false
                closeOnClick: false
                ,autoClose: false
            },
            tooltipOptions: {
                permanent: true
            },
            prevMarkerCoord: [],
            markers: [],
            lineSegments: [],
            activeMarker: {},
        }),
        created() {
            this.$root.$refs.Map = this;
        },
        methods: {
            importedJson(coordJson) {
                let newMarkers = [];
                let newLineSegments = [];
                let parsedCoord = JSON.parse(coordJson);
                let jsonMarkers = parsedCoord["markers"];
                let jsonLineSegments = parsedCoord["line_segments"];

                for(let i = 0; i < jsonMarkers.length; ++i) {
                    newMarkers.push({
                            label: jsonMarkers[i].label
                            ,lat: jsonMarkers[i].lat
                            ,lng: jsonMarkers[i].lng
                    })
                }
                console.log(newMarkers);

                let marker1 = {};
                let marker2 = {};
                for(let i in jsonLineSegments) {
                    marker1 = this.getMarkerFromMarkerLabel(jsonLineSegments[i][0], newMarkers);
                    marker2 = this.getMarkerFromMarkerLabel(jsonLineSegments[i][1], newMarkers);
                    newLineSegments.push ({
                            pt1: marker1.label
                            ,pt2: marker2.label
                            ,coord: [[marker1.lat, marker1.lng], [marker2.lat, marker2.lng]]
                    });
                }

                console.log(newLineSegments);

                this.markers = newMarkers;
                this.lineSegments = newLineSegments;
                this.activeMarker = {};
                let passArgs = [{}, this.markers, this.lineSegments];
                this.$emit("activate-toolbar", passArgs);
            },
            onClickPolyLine(event) {
                if(!this.additionMode) {
                    const verts = event.target.getLatLngs() // verts...vertices of polyline
                    console.log(this.lineSegments);
                    this.activeMode = "lineSegment";
                    this.activeMarker = this.getLineSegmentFromCoords(verts);
                    let passArgs = [this.activeMarker]
                    console.log(this.activeMarker);
                    console.log(this.lineSegments);
                    this.$emit("activate-toolbar", passArgs);
                }
            },
            getMarkerFromMarkerLabel(markerLabel, markerList) {
                console.log(markerLabel);
                console.log(markerList);
                for(let i = 0; i < markerList.length; ++i) {
                    if(markerList[i].label.toString() === markerLabel.toString()) {
                        return markerList[i];
                    }
                }

                return {};
            },
            getLineSegmentFromCoords(coords) {
                let returnLineSegment = {};

                for(let i in this.lineSegments) {
                    if(this.lineSegments[i].coord[0][0] === coords[0].lat
                        && this.lineSegments[i].coord[0][1] === coords[0].lng
                        && this.lineSegments[i].coord[1][0] === coords[1].lat
                        && this.lineSegments[i].coord[1][1] === coords[1].lng) {
                            returnLineSegment = this.lineSegments[i];
                    }
                }

                return returnLineSegment;
            },
            deleteLineSegment(lineSegment) {
                console.log(this.lineSegments);
                console.log(lineSegment);
                let toDeleteLineIndex = this.lineSegments.indexOf(lineSegment);

                this.lineSegments.splice(toDeleteLineIndex, 1);

                this.activeMode = "";
                let passArgs = [{}, this.markers, this.lineSegments];
                
                this.$emit("activate-toolbar", passArgs);
            },
            deleteMarker(marker) {
                let toDeleteMarkerIndex = this.markers.indexOf(marker);
                let toDeleteIndexes = [];

                //remove all lines connected to this marker
                console.log(this.lineSegments);
                console.log(marker);
                for(let i in this.lineSegments) {
                    if(marker.label.toString() === this.lineSegments[i].pt1.toString()
                        || marker.label.toString() === this.lineSegments[i].pt2.toString()) {
                        toDeleteIndexes.push(i);
                    }
                }

                //splice line segments from the array
                for(let i = toDeleteIndexes.length-1; i >= 0; --i) {
                    this.lineSegments.splice(toDeleteIndexes[i], 1);
                }

                //after fixing all of it now delete the point
                this.markers.splice(toDeleteMarkerIndex, 1);
                console.log(this.lineSegments);
                console.log(this.markers);

                let passArgs = [];
                //change active marker to the one before this
                if(this.markers.length === 1) {
                    this.activeMarker = this.markers[0];
                    passArgs = [this.activeMarker, this.markers, this.lineSegments];
                }
                else if(this.markers.length > 0) {
                    this.activeMarker = this.markers[toDeleteMarkerIndex-1];
                    passArgs = [this.activeMarker, this.markers, this.lineSegments];
                }
                else {
                    this.activeMarker = {};
                    passArgs = [{}, this.markers, this.lineSegments];
                }

                this.activeMode = "marker";
                this.$emit("activate-toolbar", passArgs);
            },
            getCurrentLineIndex(coords, lineIndex) {
                let index = -1;                
                
                for(let i = 0; i < this.lineSegments[lineIndex].length; ++i) {
                    if(coords.lat === this.lineSegments[lineIndex][i][0] && coords.lng === this.lineSegments[lineIndex][i][1]) {
                        index = i;
                    }
                }

                return index;
            },
            onClickMarkerHandler(marker) {
                console.log(L.point(marker.lat, marker.lng));
                if(this.additionMode === "lineAdd") {
                    if(this.markers.length > 1) {
                       if(this.activeMarker.label) {
                           console.log("IM IN");
                           console.log(this.activeMarker);
                           console.log(marker);
                           this.addNewSegment(this.activeMarker, marker);
                           this.activeMarker = {};
                           let passArgs = [{}, this.markers, this.lineSegments];
                           this.$emit("activate-toolbar", passArgs);
                       }
                       else {
                            this.activeMarker = marker;
                            //this.setActiveIcon(marker);
                            let passArgs = [this.activeMarker];
                            this.activeMode = "marker";
                            this.$emit("activate-toolbar", passArgs);
                       }
                    }
                }
                else {
                    this.activeMarker = marker;
                    //this.setActiveIcon(marker);
                    let passArgs = [this.activeMarker];
                    this.activeMode = "marker";
                    this.$emit("activate-toolbar", passArgs);
                }
            },
            nextUniqueId () {
                let missingIds = [];
                let labelNames = [];

                //if there is nothing in the marker array then just return 1 as the Id
                if(this.markers.length === 0) {
                    return 1;
                }

                //create an array of keys of markers
                labelNames = this.markers.map((marker) => parseInt(marker.label));
                labelNames.sort(function(a, b) {
                    return a - b;
                });

                console.log(labelNames);

                for (var i = 1; i <= labelNames.length; i++) {
                    if (labelNames.indexOf(i) == -1) {
                        missingIds.push(i);
                    }
                }
                console.log(missingIds);
                if(missingIds.length === 0) {
                    return this.markers.length + 1;
                }
                else {
                    return missingIds[0];
                }
            },
            addMarker(event) {
                if(this.additionMode === "addMarker" || this.additionMode === "addConnectedMarker") {
                    console.log(event);
                    let newMarker = {};
                    let newMarkerName = this.nextUniqueId();
                    console.log(newMarkerName);

                    newMarker = {label: newMarkerName, lat: event.latlng["lat"], lng: event.latlng["lng"]};
                    console.log(newMarker);
                    this.markers.push(newMarker);
                    console.log(this.markers);
                    console.log(this.$refs);
                    console.log("marker" + newMarker.label);
                    // let newRef = ("marker" + newMarker.label).toString();

                    let markLength = this.markers.length;

                    if(markLength > 1 && this.activeMarker.label && this.additionMode === "addConnectedMarker") {
                        this.addNewSegment(this.activeMarker, this.markers[markLength-1]);
                    }
                    console.log(this.lineSegments);

                    //change active marker to the one created
                    this.activeMarker = this.markers[markLength-1];
                    let passArgs = [this.activeMarker, this.markers, this.lineSegments];
                    this.activeMode = "marker";
                    this.$emit("activate-toolbar", passArgs);
                }
            },
            addNewSegment(marker1, marker2) {
                console.log(marker1);
                console.log(marker2);
                let newLineObject = {pt1: marker1.label, pt2: marker2.label, coord: [[marker1.lat, marker1.lng], [marker2.lat, marker2.lng]]};

                this.lineSegments.push(newLineObject);                
            },
            removeMarker(index) {
                this.markers.splice(index, 1);
            },
            getMarkerFromCoords(coord) {
                for(let i = 0; i < this.markers.length; ++i) {
                    if(this.markers[i].lat === coord[0] && this.markers[i].lng === coord[1]) {
                        return this.markers[i];
                    }
                }
                return {};
            },
            //get the position of the last known coordinates before dragging
            dragStartHandler(e) {
                let prevCoord = [e.target._latlng.lat, e.target._latlng.lng];
                console.log(prevCoord);
                this.prevMarkerCoord = prevCoord;

                this.activeMarker = this.getMarkerFromCoords(prevCoord);
                let passArgs = [this.activeMarker, this.markers, this.lineSegments];
                this.activeMode = "marker";
                this.$emit("activate-toolbar", passArgs);
            },
            //set the new coordinates into the lineSegments array
            dragEndHandler(e) {
                let newCoordinates = [e.target._latlng.lat, e.target._latlng.lng];
                let newLineSegments = this.lineSegments;
                //let newLineCoord = [];
                //let newLineSegment = {};
                console.log(newCoordinates);

                for(let i in newLineSegments) {
                    if(this.activeMarker.label.toString() === newLineSegments[i].pt1.toString()) {
                        console.log("Changed");
                        this.$set(this.lineSegments[i].coord, 0, newCoordinates);
                    }
                    else if(this.activeMarker.label.toString() === newLineSegments[i].pt2.toString()) {
                        console.log("Changed");
                        this.$set(this.lineSegments[i].coord, 1, newCoordinates);
                    }
                }

                console.log(this.lineSegments);
                //this.lineSegments = newLineSegments;
                for(let i = 0; i < this.markers.length; ++i) {
                    if(this.markers[i].label === this.activeMarker.label) {
                        this.$set(this.markers[i], "lat", newCoordinates[0]);
                        this.$set(this.markers[i], "lng", newCoordinates[1]);
                    }
                }
            },
        }
    }
</script>

<style scoped>
    #mapid { 
        height: 80vh; 
        width: 130vh;
        z-index: 0;
        display: block;
        align-items: center;
    }
</style>