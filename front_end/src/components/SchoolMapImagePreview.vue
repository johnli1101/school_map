<template>
    <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
            <v-btn 
                class="inner"
                icon
                v-bind="attrs"
                v-on="on" 
                @click="handleCameraImageOpen()">
                <v-icon>mdi-camera-image</v-icon>
            </v-btn>
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
                    <v-img
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
                    </v-img>
                    <!-- <div id="mapid">
                        <l-map
                            ref="map"
                            :min-zoom="minZoom"
                            :options="mapOptions"
                            :crs="crs"
                            :center="calculateCenter()"
                            @click="addMarker"
                            style="z-index: 0;"
                        >
                        <l-image-overlay
                            :url="mapImageURL"
                            :bounds="[[0, 0], mapBounds]"
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
                        </l-marker>
                        <l-polyline 
                            v-for="(line) in lineSegments"
                            :key="line.pt1 + '-' + line.pt2"
                            :lat-lngs="line.coord" 
                            :color="polylineColor(line)"
                            @click="onClickPolyLine" 
                        />
                        </l-map>
                    </div> -->
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
        <span>Check Marker Image</span>
    </v-tooltip>
</template>

<script>

// import axios from 'axios';
// import FileSaver from 'file-saver';

export default {
    created() {
        this.$root.$refs.ImagePreview = this;
    },
    data: () => ({
        currentPicture: ""
    }),
    computed: {
        additionMode() {
            return this.$store.state.additionMode;
        },
        markers() {
            return this.$store.state.markers;
        },
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

    },
    props: {
        
    },
    methods: {
        handleCameraImageOpen() {
            this.$store.dispatch('changeDialogCameraPreview', true);
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
            this.$store.dispatch('changeDialogCameraPreview', false);
            this.$root.$refs.TakePicture.handleCameraConfirmTakePicture();
        },
    }
}
</script>

<style scoped>

</style>