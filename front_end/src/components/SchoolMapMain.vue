<template>
    <div id="mapid">
        <l-map
            ref="map"
            :min-zoom="minZoom"
            :crs="crs"
            :center="calculateCenter()"
            @click="addMarker"
            style="z-index: 0;"
        >
        <l-image-overlay
            :url="this.mapImageURL"
            :bounds="[[0,0], this.mapBounds]"
        />
        <l-marker
            v-for="marker in markers"
            :key="marker.label"
            :lat-lng="marker"
            :ref="'marker-' + marker.label"
            :icon="getIcon(marker)"
            :draggable="true"
            @dragstart="dragStartHandler"
            @dragend="dragEndHandler"
            @click="onClickMarkerHandler(marker)"
        >
            <l-tooltip 
                v-if="marker.label === activeMarker.label"
                :options="tooltipOptions" 
                class="leaflet-tooltip"
            >
                {{marker.label}}
            </l-tooltip>
            <l-tooltip 
                v-else
                :options="tooltipOptions"
            >
                {{marker.label}}
            </l-tooltip>
            <!-- <l-popup :content="marker.label" :options="popupOptions" /> -->
        </l-marker>
        <l-polyline 
            v-for="(line) in lineSegments"
            :key="line.pt1 + '-' + line.pt2"
            :lat-lngs="line.coord" 
            :color="polylineColor(line)"
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
    // import FileSaver from 'file-saver';
    import L from 'leaflet';
    import { LMap, LImageOverlay, LMarker, LPolyline, LTooltip } from "vue2-leaflet";

    export default {
        components: {
            LMap,
            LImageOverlay,
            LMarker,
            LPolyline,
            LTooltip,
            //FileSaver
        },
        props: {
            // mapImageURL: String
            // ,mapBounds: Array
        },
        computed: {
            additionMode() {
                return this.$store.state.additionMode;
            },
            activeMarker() {
                return this.$store.state.activeMarker;
            },
            activeMode() {
                return this.$store.state.activeMode;
            },
            markers() {
                return this.$store.state.markers;
            },
            lineSegments() {
                return this.$store.state.lineSegments;
            },
            mapBounds() {
                return this.$store.state.mapBounds;
            },
            mapImageURL() {
                return this.$store.state.mapImageURL;
            },
            mapImageName() {
                return this.$store.state.mapImageName;
            },
            keyListen() {
                return this.$store.state.keyListen;
            }
        },
        data: () => ({
            minZoom: -1,
            crs: L.Util.extend(L.CRS.Simple, {
                    transformation: new L.Transformation(1,0,1,0)
                }),
            tooltipOptions: {
                permanent: true
            },
            prevMarkerCoord: [],
            testImage: "",
        }),
        created() {
            this.$root.$refs.Map = this;

            this.startSession();
            this.loadFromDatabase();

            //handle button presses
            window.addEventListener('keydown', (e) => {
                if(this.keyListen) {
                    //console.log(this.keyListen);
                    switch(e.key) {
                        case "d":
                            if(this.activeMode === "marker" && this.markers.length > 0) {
                                //handle delete function
                                this.$root.$refs.MarkerDeleteConfirm.handleClickDelete()
                            }
                            else if(this.activeMode === "lineSegment" && this.lineSegments.length > 0) {
                                this.$root.$refs.LineDeleteConfirm.handleClickLineDelete()
                            }
                            break;
                        case "c":
                            if(this.activeMode === "marker" && !this.activeMarker.picture) {
                                //handle delete function
                                this.$store.dispatch('changeDialogCameraConfirm', true);
                            }
                            break;
                        case "v":
                            if(this.activeMode === "marker" && this.activeMarker.picture) {
                                //handle delete function
                                // this.$root.$refs.ImagePreview.handleCameraImageOpen()
                                this.$store.dispatch('changeDialogCameraPreview', true);
                            }
                            break;
                        case "q":
                            this.$store.dispatch('changeMode', "addMarker");
                            break;
                        case "w":
                            this.$store.dispatch('changeMode', "addConnectedMarker");
                            break;
                        case "e":
                            this.$store.dispatch('changeMode', "lineAdd");

                            break;
                    }
                }
            });
        },
        methods: {
            async startSession() {
                //this.$store.dispatch('changeLoading', true);

                //prevent the camera from sleeping, so set the delay option to 0 if it is not already set
                this.axios.post("http://localhost:5000/getOptions", {optionNames: ["offDelay"]}).then(response => {
                    console.log(response);
                    //if the setting is not set already then set the delay to it
                    console.log(response["data"]["results"]["options"]["offDelay"])
                    if(response["data"]["results"]["options"]["offDelay"] !== 0
                        && response["data"]["results"]["options"]["offDelay"] !== 65535) {
    
                        this.axios.post("http://localhost:5000/setOptions", {options: {offDelay: 65535}}).then(response2 => {
                            console.log(response2);
                        }).catch(error2 => {
                            console.log(error2);
                        });
                   }
                }).catch(error => {
                    console.log(error);
                });

                //this.$store.dispatch('changeLoading', false);
            
            },
            //loads all markers and images from database if it was saved
            async loadFromDatabase() {
                this.$store.dispatch('changeLoading', true);
                await this.axios.get("http://localhost:5000/load").then(response => {
                    console.log(response);
                    this.$store.dispatch('setNewMarkersList', response["data"]["markers"]);
                    this.$store.dispatch('setNewLineSegmentsList', response["data"]["line_segments"]);
                    this.$store.dispatch('changeMapImageUrl', response["data"]["map_settings"]["mapImageURL"]);
                    this.$store.dispatch('changeMapBounds', response["data"]["map_settings"]["mapBounds"]);
                    console.log(JSON.stringify(this.mapBounds));
                    console.log(this.mapImageURL);
                }).catch(error => {
                    console.log(error);
                });
                
                this.$store.dispatch('changeLoading', false);
            },
            getIcon(marker) {
                if(marker.picture) {
                    return L.icon({
                        iconUrl: require("../assets/map_icon_filled.png"),
                        iconSize: [37, 40],
                        iconAnchor: [16, 37]
                    })
                }
                else {
                    return L.icon({
                        iconUrl: require("../assets/map_icon_default.png"),
                        iconSize: [37, 40],
                        iconAnchor: [16, 37]
                    })
                }
            },
            polylineColor(line) {
                if(this.activeMarker.pt1 === line.pt1
                    && this.activeMarker.pt2 === line.pt2) {
                        console.log("Hello");
                    return "purple";
                }
                return "#0097FF";
            },
            calculateCenter() {
                return [this.mapBounds[0] / 2, this.mapBounds[1] / 2];
            },
            importedJson(coordJson) {
                let newMarkers = [];
                let newLineSegments = [];
                let parsedCoord = JSON.parse(coordJson);
                let jsonMarkers = parsedCoord["markers"];
                let jsonLineSegments = parsedCoord["line_segments"];

                for(let i in jsonMarkers) {
                    newMarkers.push({
                        label: i
                        ,picture: jsonMarkers[i].picture
                        ,lat: jsonMarkers[i].lat
                        ,lng: jsonMarkers[i].lng
                        ,pictureMarkers: jsonMarkers[i].pictureMarkers
                    })
                }

                console.log(newMarkers);

                for(let i in jsonLineSegments) {
                    newLineSegments.push ({
                            pt1: jsonLineSegments[i]["pt1"]
                            ,pt2: jsonLineSegments[i]["pt2"]
                            ,coord: jsonLineSegments[i]["coord"]
                    });
                }

                console.log(newLineSegments);

                this.$store.dispatch('setNewMarkersList', newMarkers);
                this.$store.dispatch('setNewLineSegmentsList', newLineSegments);
                this.$store.dispatch('changeActiveMarker', {});                

                let payload = {
                    markers: newMarkers
                    ,line_segments: newLineSegments
                    ,map_settings: {
                        map_image: this.mapImageURL
                        ,map_height: this.mapBounds[0]
                        ,map_width: this.mapBounds[1]
                    }
                }
                this.axios.post("http://localhost:5000/save", payload).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                });  

            },
            onClickPolyLine(event) {
                if(!this.additionMode) {
                    const verts = event.target.getLatLngs() // verts...vertices of polyline
                    this.$store.dispatch('changeActiveMode', "lineSegment");
                    this.$store.dispatch('changeActiveMarker', this.getLineSegmentFromCoords(verts));
                    console.log(this.activeMarker);
                    console.log(this.lineSegments);
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
             async deleteLineSegment(lineSegment) {
                console.log(this.lineSegments);
                console.log(lineSegment);

                this.$store.dispatch('deleteFromLineSegments', lineSegment);
                await this.axios.post("http://localhost:5000/deleteLineSegment", lineSegment).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                });
                this.$store.dispatch('changeActiveMode', "");
            },
            async deleteMarker(marker) {
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

                this.$store.dispatch('changeLoading', true);

                //splice line segments from the array
                for(let i = toDeleteIndexes.length-1; i >= 0; --i) {
                    
                    //------this section is a temporary workaround ----------
                    let line_segment = this.lineSegments[toDeleteIndexes[i]];
                    let tempLineSegment = {
                        pt1: line_segment["pt1"]
                        ,pt2: line_segment["pt2"]
                        ,coord: [[line_segment["coord"][0][0], line_segment["coord"][0][1]], [line_segment["coord"][1][0], line_segment["coord"][1][1]]]
                    }
                    // -------------------------------------------------------

                    this.$store.dispatch('deleteFromLineSegments', this.lineSegments[toDeleteIndexes[i]]);
                    await this.axios.post("http://localhost:5000/deleteLineSegment", tempLineSegment).then(response => {
                        console.log(response);
                    }).catch(error => {
                        console.log(error);
                    });
                }

                //after fixing all of it now delete the point
                this.$store.dispatch('deleteFromMarkers', marker);
                await this.axios.post("http://localhost:5000/deleteMarker", marker).then(response => {
                        console.log(response);
                    }).catch(error => {
                        console.log(error);
                    });

                console.log(this.lineSegments);
                console.log(this.markers);

                this.$store.dispatch('changeActiveMode', "marker");
                this.$store.dispatch('changeLoading', false);
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
            checkForDoubleLines(marker1, marker2) {
                for(let i = 0; i < this.lineSegments.length; ++i) {
                    if((this.lineSegments[i].pt1 === marker1.label && this.lineSegments[i].pt2 === marker2.label)
                        || (this.lineSegments[i].pt1 === marker2.label && this.lineSegments[i].pt2 === marker1.label)) {
                        return true;
                    }
                }
                return false;
            },
            onClickMarkerHandler(marker) {
                //set active image marker to nothing
                console.log(marker)
                this.$store.dispatch('changeActiveImageMarker', {});
                if(this.additionMode === "lineAdd") {
                    if(this.markers.length > 1) {
                       if(this.activeMarker.label) {
                            if(!this.checkForDoubleLines(this.activeMarker, marker)) {
                                this.addNewSegment(this.activeMarker, marker);
                                this.$store.dispatch('changeActiveMarker', {});
                            }
                            else {
                                this.$store.dispatch('changeActiveMarker', {});
                            }
                       }
                       else {
                            this.$store.dispatch('changeActiveMarker', marker);
                            this.$store.dispatch('changeActiveMode', "marker");
                       }
                    }
                }
                else {
                    this.$store.dispatch('changeActiveMarker', marker);
                    this.$store.dispatch('changeActiveMode', "marker");
                }
                console.log(JSON.stringify(this.activeMarker));
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
            async addMarker(event) {
                if(this.additionMode === "addMarker" || this.additionMode === "addConnectedMarker") {
                    console.log(event);
                    let newMarker = {};
                    let newMarkerName = this.nextUniqueId();
                    console.log(newMarkerName);

                    newMarker = {label: newMarkerName, lat: event.latlng["lat"], lng: event.latlng["lng"], picture: "", pictureMarkers: []};
                    console.log(newMarker);
                    this.$store.dispatch('addToMarkers', newMarker);
                    this.$store.dispatch('changeLoading', true);
                    await this.axios.post("http://localhost:5000/addMarker", newMarker).then(response => {
                        console.log(response);
                        
                    }).catch(error => {
                        console.log(error);
                    });
                    this.$store.dispatch('changeLoading', false);
                    console.log(this.markers);
                    console.log(this.$refs);
                    console.log("marker" + newMarker.label);

                    let markLength = this.markers.length;

                    if(markLength > 1 && this.activeMarker.label && this.additionMode === "addConnectedMarker") {
                        await this.addNewSegment(this.activeMarker, this.markers[markLength-1]);
                    }
                    console.log(this.lineSegments);

                    //change active marker to the one created
                    this.$store.dispatch('changeActiveMarker', this.markers[markLength-1]);
                    this.$store.dispatch('changeActiveMode', "marker");
                }
            },
            async addNewSegment(marker1, marker2) {
                console.log(marker1);
                console.log(marker2);
                let newLineObject = {pt1: marker1.label, pt2: marker2.label, coord: [[marker1.lat, marker1.lng], [marker2.lat, marker2.lng]]};
                this.$store.dispatch('addToLineSegments', newLineObject);   
                this.axios.post("http://localhost:5000/addLineSegment", newLineObject).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                });         
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

                this.$store.dispatch('changeActiveMarker', this.getMarkerFromCoords(prevCoord));
                this.$store.dispatch('changeActiveMode', "marker");
                console.log(this.activeMarker);
            },
            //set the new coordinates into the lineSegments array
            async dragEndHandler(e) {
                let newCoordinates = [e.target._latlng.lat, e.target._latlng.lng];
                let newLineSegments = this.lineSegments;
                console.log(this.lineSegments);
                let toChangeLineSegment = {};
                let payload = {};
                let databaseLineSegment = {};

                console.log(newCoordinates);

                this.$store.dispatch('changeLoading', true);

                for(let i = 0; i < newLineSegments.length; ++i) {
                    toChangeLineSegment = this.lineSegments[i];
                    databaseLineSegment = toChangeLineSegment;
                    if(this.activeMarker.label.toString() === newLineSegments[i].pt1.toString()) {
                        payload = {
                            coordIndex: 0
                            ,newCoord: newCoordinates
                            ,lineSegment: toChangeLineSegment
                        };
                        this.$store.dispatch('updateLineByIndexCoord', payload);

                        databaseLineSegment.coord[0] = newCoordinates; 
                        await this.axios.post("http://localhost:5000/updateLineSegment", databaseLineSegment).then(response => {
                            console.log(response);
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                    else if(this.activeMarker.label.toString() === newLineSegments[i].pt2.toString()) {
                        payload = {
                            coordIndex: 1
                            ,newCoord: newCoordinates
                            ,lineSegment: toChangeLineSegment
                        };
                        this.$store.dispatch('updateLineByIndexCoord', payload);

                        databaseLineSegment.coord[1] = newCoordinates;
                        await this.axios.post("http://localhost:5000/updateLineSegment", databaseLineSegment).then(response => {
                            console.log(response);
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                }

                console.log(this.lineSegments);

                payload = {
                    newLat: newCoordinates[0]
                    ,newLng: newCoordinates[1]
                    ,marker: this.activeMarker
                }
                this.$store.dispatch('updateMarkers', payload);

                let databaseMarker = this.activeMarker;
                databaseMarker["lat"] = newCoordinates[0];
                databaseMarker["lng"] = newCoordinates[1];
                await this.axios.post("http://localhost:5000/updateMarker", this.activeMarker).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                });

                this.$store.dispatch('changeLoading', false);
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
    .leaflet-tooltip {
        background-color: #006FFF;
        color: #FFFFFF;
    }
</style>