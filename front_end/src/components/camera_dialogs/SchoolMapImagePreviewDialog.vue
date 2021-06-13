<template>
    <v-dialog
        v-model="dialogCameraPreview"
        width="150vh"
        height="150vh"
        @keydown.esc="handleCameraImageClose()"
        @click:outside="handleCameraImageClose()"
    >
        <v-card>
            <v-card-title class="headline grey lighten-2">
                Marker: {{activeMarker.label}} Image
            </v-card-title>
            <!-- <v-img
                class="cameraPicture"
                :src="activeMarker.picture"
                lazy-src=""
                max-width="1200"
                max-height="700"
            >
                <template v-slot:placeholder>
                    <v-row
                        class="fill-height ma-0"
                        align="center"
                        justify="center"
                    >
                    <v-progress-circular
                        :size="70"
                        :width="7"
                        color="purple"
                        indeterminate
                    >
                    </v-progress-circular>
                    </v-row>
                </template>
            </v-img> -->
            <div id="mapid">
                <l-map
                    ref="map"
                    :min-zoom="minZoom"
                    :options="mapOptions"
                    :crs="crs"
                    :center="[0,0]"
                    style="z-index: 0;"
                >
                <l-image-overlay
                    :url="activeMarker.picture"
                    :bounds="[[0, 0], mapBounds]"
                />
                <l-marker
                    v-for="imageMarker in imageMarkers"
                    :key="imageMarker.label"
                    :lat-lng="imageMarker"
                    :icon="getIcon()"
                    :draggable="true"
                >
                    <l-popup>
                        Hello
                        <button >add marker</button>
                    </l-popup>
                </l-marker>
                </l-map>
            </div>
            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
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
                    Upload Picture Marker
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
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>

// import axios from 'axios';
// import FileSaver from 'file-saver';

import L from 'leaflet';
import { LMap, LImageOverlay, LMarker, LPopup } from "vue2-leaflet";

export default {
    created() {
        this.$root.$refs.ImagePreview = this;
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
        // mapBounds: [[2688, 5376], [-2688, -5376]],
        mapBounds: [618.24, 1236.48],
        imageMarkers: []
    }),
    computed: {
        activeMarker() {
            return this.$store.state.activeMarker;
        },
        activeMode() {
            return this.$store.state.activeMode;
        },
        dialogCameraPreview() {
            return this.$store.state.dialogCameraPreview;
        }
    },
    components: {
        LMap,
        LImageOverlay,
        LMarker,
        LPopup
    },
    props: {
        
    },
    methods: {
        calculateCenter() {
            return [this.mapBounds[0] / 2, this.mapBounds[1] / 2];
        },
        getIcon() {
            // if(marker.picture) {
            //     return L.icon({
            //         iconUrl: require("../assets/map_icon_filled.png"),
            //         iconSize: [37, 40],
            //         iconAnchor: [16, 37]
            //     })
            // }
            //else {
                return L.icon({
                    iconUrl: require("../../assets/map_icon_default.png"),
                    iconSize: [37, 40],
                    iconAnchor: [16, 37]
                })
            // }
        },
        handleCameraImageClose() {
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

            let response = await this.axios.post("http://localhost:5000/downloadPhoto", {fileUrl: this.activeMarker.picture}, {responseType: "blob"});

            console.log(response);
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