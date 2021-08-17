<template>
    <span>
        <v-dialog
            v-model="dialogCameraPreview"
            width="150vh"
            height="150vh"
            @keydown.esc="handleCameraImageClose()"
            @click:outside="handleCameraImageClose()"
        >
            <v-card>
                <v-card-title class="headline grey lighten-2">
                    <span v-if="!uploadMode">
                        Marker: {{activeMarker.label}} Image
                    </span>
                    <span v-else>
                        Please select a point on the image to place a marker.
                    </span>
                </v-card-title>
                <div id="mapid">
                    <l-map
                        ref="map"
                        :min-zoom="minZoom"
                        :options="mapOptions"
                        @click="uploadNewImage"
                        :crs="crs"
                        :center="[0,0]"
                        style="z-index: 0;"
                    >
                    <l-image-overlay
                        :url="getMarkerPicture()"
                        :bounds="[[0, 0], mapBounds]"
                    />
                    <l-marker
                        v-for="imageMarker in activeMarker['pictureMarkers']"
                        :key="imageMarker.label"
                        :lat-lng="imageMarker"
                        :icon="getIcon()"
                        :draggable="uploadMode"
                        @dragend="dragEndHandler($event, imageMarker)"
                        @click="onClickImageMarker(imageMarker)"
                    >
                        <!-- <l-popup
                            :options="popupOptions"
                        >
                            Hello
                            <button >add marker</button>
                        </l-popup> -->
                        <l-tooltip 
                            :options="tooltipOptions"
                        >
                            {{imageMarker.label}}
                        </l-tooltip>
                    </l-marker>
                    </l-map>
                </div>
                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <span v-if="!uploadMode">
                        <v-btn
                            color="primary"
                            text
                            @click="handleRetakePhotoFromImage()"
                        >
                            Retake Photo
                        </v-btn>
                        <v-btn
                            color="primary"
                            text
                            @click="handleClickUpPicMarker()"
                        >
                            Upload and Move Picture Marker
                        </v-btn>
                        <v-btn
                            color="primary"
                            text
                            @click="handleDownloadImage()"
                        >
                            Download Image
                        </v-btn>
                        <v-btn
                            color="primary"
                            text
                            @click="handleCameraImageClose()"
                        >
                            Cancel
                        </v-btn>
                    </span>
                    <span v-else>
                        <v-btn
                            color="primary"
                            text
                            @click="uploadMode = false"
                        >
                            Done
                        </v-btn>
                    </span>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <SchoolMapMarkerImageUpload @upload-image="uploadImage($event)" @upload-image-url="uploadImageUrl($event)" @upload-app="uploadApp($event)" @delete-last-marker="deleteLastMarker()"/>
        <MarkerImagePreviewDialog @delete-marker="deleteCurrentMarker()" />
    </span>
</template>

<script>

// import axios from 'axios';
// import FileSaver from 'file-saver';

import L from 'leaflet';
import { LMap, LImageOverlay, LMarker, LTooltip } from "vue2-leaflet";
import SchoolMapMarkerImageUpload from './SchoolMapMarkerImageUpload';
import MarkerImagePreviewDialog from './MarkerImagePreviewDialog';

export default {
    created() {
        this.$root.$refs.ImagePreview = this;
    },
    components: {
        LMap,
        LImageOverlay,
        LMarker,
        LTooltip,
        SchoolMapMarkerImageUpload,
        MarkerImagePreviewDialog
    },
    data: () => ({
        minZoom: -1,
        zoom: 1,
        crs: L.Util.extend(L.CRS.Simple, {
                transformation: new L.Transformation(1,0,1,0)
            }),
        testImage: "",
        mapOptions: { zoomControl: true
                        ,scrollWheelZoom: true
                        ,dragging: true },
        mapBounds: [618.24, 1236.48],
        imageMarkers: [],
        uploadMode: false,
        popupOptions: {
            autoPan: false
        },
        tooltipOptions: {
            permanent: true
        },
        dialogUploadImage: false,
    }),
    computed: {
        localHostName() {
            return this.$store.state.localHostName;
        },
        databaseLocalHost() {
            return this.$store.state.databaseLocalHost;
        },
        activeMarker() {
            return this.$store.state.activeMarker;
        },
        activeImageMarker() {
            return this.$store.state.activeImageMarker;
        },
        activeMode() {
            return this.$store.state.activeMode;
        },
        dialogCameraPreview() {
            return this.$store.state.dialogCameraPreview;
        },
        updateImageMarkerMode() {
            return this.$store.state.updateImageMarkerMode;
        }
    },
    props: {
        
    },
    methods: {
        calculateCenter() {
            return [this.mapBounds[0] / 2, this.mapBounds[1] / 2];
        },
        getIcon() {
            return L.icon({
                iconUrl: require("../../assets/map_icon_filled.png"),
                iconSize: [37, 40],
                iconAnchor: [16, 37]
            })
        },
        getMarkerPicture() {
            console.log(this.activeMarker.picture);
            if(this.activeMarker.picture !== "" && this.activeMarker.picture !== undefined) {
                let filename = this.activeMarker.picture.substr(this.activeMarker.picture.lastIndexOf('/') + 1);
                console.log(filename);

                return "http://" + this.localHostName +"/uploaded_assets/camera/" + filename;
            }
            return "";
        },
        async deleteCurrentMarker() {
            let payload = {
                markerToChange: this.activeMarker,
                imageMarker: this.activeImageMarker
            }
            // this.activeImageMarker = {};
            let toDeleteImageMarker = this.activeImageMarker;
            this.$store.dispatch('changeActiveImageMarker', {});
            this.$store.dispatch('deleteImageMarker', payload);

            this.$store.dispatch('changeLoading', true);
            toDeleteImageMarker["marker_label"] = this.activeMarker["label"];
            await this.axios.post("http://" + this.databaseLocalHost + "/deleteImageMarker", toDeleteImageMarker).then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error);
            });
            this.$store.dispatch('changeLoading', false);
        },
        //when image marker is dragged just need to update the lat and lng with new points
        async dragEndHandler(e, currentMarker) {
            console.log(e.target._latlng.lat);
            console.log(e.target._latlng.lng);
            // this.activeImageMarker = currentMarker;
            this.$store.dispatch('changeActiveImageMarker', currentMarker);
            let payload = {
                markerToChange: this.activeMarker
                ,imageMarker: this.activeImageMarker
                ,newLat: e.target._latlng.lat
                ,newLng: e.target._latlng.lng
            };
            this.$store.dispatch('updateImageMarkerCoord', payload);

            this.$store.dispatch('changeLoading', true);
            let newImageMarker = this.activeImageMarker;
            newImageMarker["lat"] = e.target._latlng.lat;
            newImageMarker["lng"] = e.target._latlng.lng;
            newImageMarker["marker_label"] = this.activeMarker["label"];
            await this.axios.post("http://" + this.databaseLocalHost + "/updateImageMarker", newImageMarker).then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error);
            });
            this.$store.dispatch('changeLoading', false);
        },
        async uploadImageUrl(fileUrl) {
            this.$store.dispatch('changeLoading', true);
            // let newFilePath = "";
            // console.log(fileUrl);
            // await this.axios.post("http://" + this.databaseLocalHost + "/uploadImageUrl", {link: fileUrl}).then(response => {
            //     console.log(response);
            //     newFilePath = response["data"];
            // }).catch(error => {
            //     console.log(error);
            //     return;
            // });
            // console.log(newFilePath);
            this.changeImageMarkerImage(fileUrl, this.activeImageMarker, "image");
            this.$store.dispatch('changeLoading', false);
        },
        //using this functino assumes that you already have an active marker
        async uploadImage(fileObj) {
            //let imageUrl = payload[1]
            //console.log(payload[1])
            console.log(JSON.stringify(fileObj));
            let newFilename = await this.uploadImageToFileSystem(fileObj);
            console.log(newFilename);
            this.changeImageMarkerImage(newFilename, this.activeImageMarker, "url");
            console.log(this.activeMarker);
            this.$store.dispatch('updateImageVariable', false);
            //this.$store.dispatch('changeDialogImageMarkerPreview', true);
        },
        async uploadImageToFileSystem(file) {
            console.log(file);
            let newFilename = "";
            var data = new FormData()
            data.append('file', file);
            // data.append('folder', "markers");
            console.log(data);
            await this.axios.post("http://" + this.databaseLocalHost + "/uploadImage", data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(response => {
                console.log(response);
                newFilename = response["data"];

            }).catch(error => {
                console.log(error);
            });

            return newFilename;
        },
        async changeImageMarkerImage(imageUrl, imageMarker) {
            let payload = {
                markerToChange: this.activeMarker
                ,imageMarker: imageMarker
                ,newImage: imageUrl
            }
            this.$store.dispatch('updateImageMarkerImage', payload);

            this.$store.dispatch('changeLoading', true);
            let newImageMarker = imageMarker;
            newImageMarker["picture"] = imageUrl;
            newImageMarker["marker_label"] = this.activeMarker["label"]
            console.log(imageUrl);
            if(this.updateImageMarkerMode) {
                await this.axios.post("http://" + this.databaseLocalHost + "/updateImageMarker", newImageMarker).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                });            
            }
            else {
                await this.axios.post("http://" + this.databaseLocalHost + "/addImageMarker", newImageMarker).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                });
            }
            this.$store.dispatch('changeLoading', false);
            console.log(this.activeImageMarker);
        },
        onClickImageMarker(marker) {
            if(!this.uploadMode) {
                console.log("Hello");
                //this.activeImageMarker = marker;
                this.$store.dispatch('changeActiveImageMarker', marker);
                this.$store.dispatch('changeDialogImageMarkerPreview', true);
            }
        },
        handleImageImport() {
            let file = this.currentFile;
            let newCoordJson = {};
            console.log(file);
            
            let reader = new FileReader();

            reader.readAsText(file, "UTF-8");

            this.$store.dispatch('changeLoading', true);
            reader.onload =  evt => {
                newCoordJson = evt.target.result;
                console.log(newCoordJson);
                console.log(this.checkJsonIntegrity(newCoordJson));
                if(this.checkJsonIntegrity(newCoordJson)){
                    this.$emit("on-import-json", newCoordJson);
                } else {
                    this.errorArray.push("Integrity of json does not match with coordinates json");
                }
                this.$store.dispatch('changeLoading', false);
                
            }
            reader.onerror = evt => {
                console.error(evt);
            }
            this.currentFile = [];
            this.dialog = false;
        },
        uploadNewImage(event) {
            if(this.uploadMode) {
                this.addNewImageMarker(event.latlng);
                this.$store.dispatch('changeDialogUploadImage', true);
            }
        },
        deleteLastMarker() {
            let imageMarkerLength = this.activeMarker["pictureMarkers"].length;
            let payload = {
                markerToChange: this.activeMarker,
                imageMarker: this.activeMarker["pictureMarkers"][imageMarkerLength-1]
            }
            this.$store.dispatch('deleteImageMarker', payload);
            this.$store.dispatch('changeActiveImageMarker', {})
        },
        nextUniqueId () {
            let missingIds = [];
            let labelNames = [];

            //if there is nothing in the marker array then just return 1 as the Id
            if(this.activeMarker["pictureMarkers"].length === 0) {
                return 1;
            }

            //create an array of keys of markers
            labelNames = this.activeMarker["pictureMarkers"].map((marker) => parseInt(marker.label));
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
                return this.activeMarker["pictureMarkers"].length + 1;
            }
            else {
                return missingIds[0];
            }
        },
        addNewImageMarker(latlngObj) {
            let newMarkerName = this.nextUniqueId();
            let newMarker = {label: newMarkerName, lat: latlngObj["lat"], lng: latlngObj["lng"], picture: ""};
            let payload = {
                markerToChange: this.activeMarker
                ,newImageMarker: newMarker
            }
            //this.activeImageMarker = newMarker;
            this.$store.dispatch('changeActiveImageMarker', newMarker);
            console.log(newMarker);
            this.$store.dispatch('addNewImageMarker', payload);
        },
        removeImageMarker(marker) {
            this.$store.dispatch('deleteFromImageMarkers', marker);
        },
        handleClickUpPicMarker() {
            this.uploadMode = true;

        },
        handleCameraImageClose() {
            this.uploadMode = false;
            this.$store.dispatch('changeDialogCameraPreview', false);
        },
        async handleDownloadImage() {
            //await this.downloadImage(this.activeMarker.picture);
            console.log(this.activeMarker.picture);

            // let url = this.activeMarker.picture;

            // fetch(url)
            //     .then((response) => response.blob())
            //     .then((blob) => {
            //     FileSaver.saveAs(blob, 'image_name.jpg');
            //     });
            // console.log('downloading', url);

            let filename = this.activeMarker.picture.substr(this.activeMarker.picture.lastIndexOf('/') + 1);
            console.log(filename);

            this.$store.dispatch('changeLoading', true);
            let pictureUrl = "http://" + this.localHostName + "/uploaded_assets/camera/" + filename;
            let response = await this.axios.post("http://" + this.databaseLocalHost + "/downloadPhoto", {fileUrl: pictureUrl}, {responseType: "blob"});

            // console.log(response);
            var fileURL = window.URL.createObjectURL(new Blob([response.data]));
            var fileLink = document.createElement('a');

            fileLink.href = fileURL;
            fileLink.setAttribute('download', filename);
            document.body.appendChild(fileLink);

            fileLink.click();
            this.$store.dispatch('changeLoading', false);
            
        },
        handleRetakePhotoFromImage() {
            this.$store.dispatch('changeDialogCameraConfirm', true);
        },
    }
}
</script>

<style scoped>
    #mapid { 
        height: 75vh; 
        width: 140vh;
        z-index: 0;
        display: block;
        align-items: center;
    }
</style>