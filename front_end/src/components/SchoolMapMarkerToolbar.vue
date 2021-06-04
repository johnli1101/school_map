<template>
    <v-card
        dark
        flat
        tile
        bottom
    >
        <v-toolbar extended>
            <span v-if="additionMode === 'addMarker'">
                <v-tooltip top>
                    <template v-slot:activator="{ on1, attrs1 }">
                        <v-btn 
                            icon
                            v-bind="attrs1"
                            v-on="on1" 
                            @click="handleChangeMode('')">
                            <v-icon>mdi-plus-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>Addition Mode Off</span>
                </v-tooltip>
            </span>
            <span v-else>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleChangeMode('addMarker')">
                            <v-icon>mdi-plus-thick</v-icon>
                        </v-btn>
                    </template>
                    <span>Addition Mode On</span>
                </v-tooltip>
            </span>
            <span v-if="additionMode === 'addConnectedMarker'">
                <v-tooltip top>
                    <template v-slot:activator="{ on1, attrs1 }">
                        <v-btn 
                            icon
                            v-bind="attrs1"
                            v-on="on1" 
                            @click="handleChangeMode('')">
                            <v-icon>mdi-pencil-plus-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>Add Connected Marker Off</span>
                </v-tooltip>
            </span>
            <span v-else>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleChangeMode('addConnectedMarker')">
                            <v-icon>mdi-pencil-plus</v-icon>
                        </v-btn>
                    </template>
                    <span>Add Connected Marker On</span>
                </v-tooltip>
            </span>
            <span v-if="additionMode === 'lineAdd'">
                <v-tooltip top>
                    <template v-slot:activator="{ on1, attrs1 }">
                        <v-btn 
                            icon
                            v-bind="attrs1"
                            v-on="on1" 
                            @click="handleChangeMode('')">
                            <v-icon>mdi-card-plus-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>Line Add Mode Off</span>
                </v-tooltip>
            </span>
            <span v-else>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleChangeMode('lineAdd')">
                            <v-icon>mdi-card-plus</v-icon>
                        </v-btn>
                    </template>
                    <span>Line Add Mode On</span>
                </v-tooltip>
            </span>
            <v-toolbar-title>
                <span v-if="activeMode === 'marker'">
                    Marker: {{activeMarker.label}}
                </span>
                <span v-else-if="activeMode === 'lineSegment'">
                    Line Segment: {{activeMarker.pt1}} to {{activeMarker.pt2}}
                </span>
                <span v-else>
                
                </span>
            </v-toolbar-title>
        
            <v-spacer></v-spacer>
            <span v-if="activeMode === 'marker'" class="outer">
                <span v-if="activeMarker.picture">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn 
                                class="inner"
                                icon
                                v-bind="attrs"
                                v-on="on" 
                                @click="dialogCameraImage = true">
                                <v-icon>mdi-camera-image</v-icon>
                            </v-btn>
                            <v-dialog
                                v-model="dialogCameraImage"
                                width="150vh"
                                height="150vh"
                                @keydown.esc="dialogCameraImage = false"
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
                                            @click="handleDownloadImage()"
                                        >
                                            Download Image
                                        </v-btn>
                                        <v-btn
                                            color="primary"
                                            text
                                            @click="dialogCameraImage = false"
                                        >
                                            Cancel
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </template>
                        <span>Check Marker Image</span>
                    </v-tooltip>
                </span>
                <span v-else>
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn 
                                class="inner"
                                icon
                                v-bind="attrs"
                                v-on="on" 
                                @click="handleCameraConfirm()">
                                <v-icon>mdi-camera</v-icon>
                            </v-btn>
                            <v-dialog
                                v-model="dialogCameraConfirm"
                                width="50vh"
                                height="100vh"
                                @keydown.enter="handleCameraConfirmTakePicture()"
                                @keydown.esc="dialogCameraConfirm = false"
                            >
                                <v-card>
                                    <v-card-title class="headline grey lighten-2">
                                        Do you want to take a picture?
                                    </v-card-title>

                                    <v-divider></v-divider>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            color="primary"
                                            text
                                            @click="handleCameraConfirmTakePicture()"
                                        >
                                            Yes
                                        </v-btn>
                                        <v-btn
                                            color="primary"
                                            text
                                            @click="dialogCameraConfirm = false"
                                        >
                                            Cancel
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-dialog
                                v-model="dialogCamera"
                                width="150vh"
                                height="150vh"
                                persistent
                            >
                                <v-card>
                                    <v-card-title class="headline grey lighten-2">
                                        Assign this photo to this Marker: {{activeMarker.label}} ?
                                    </v-card-title>
                                            <v-img
                                                class="cameraPicture"
                                                :src="currentPicture"
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
                                    <v-divider></v-divider>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            color="primary"
                                            text
                                            @click="handleKeepPhoto()"
                                        >
                                            Keep this photo
                                        </v-btn>
                                        <v-btn
                                            color="primary"
                                            text
                                            @click="handleRetakePhoto()"
                                        >
                                            Retake Photo
                                        </v-btn>
                                        <v-btn
                                            color="primary"
                                            text
                                            @click="dialogCamera = false"
                                        >
                                            Cancel
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </template>
                        <span>Take a Picture</span>
                    </v-tooltip>
                </span>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            class="inner"
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleClickDelete()">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-dialog
                            v-model="dialog"
                            width="50vh"
                            height="100vh"
                            @keydown.enter="handleOnDelete"
                            @keydown.esc="dialog = false"
                        >
                            <v-card>
                                <v-card-title class="headline grey lighten-2">
                                    Are you sure you want to delete this point?
                                </v-card-title>

                                <v-divider></v-divider>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="primary"
                                        text
                                        @click="handleOnDelete"
                                    >
                                        Yes
                                    </v-btn>
                                    <v-btn
                                        color="primary"
                                        text
                                        @click="dialog = false"
                                    >
                                        Cancel
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </template>
                    <span>Delete</span>
                </v-tooltip>
            </span>
            <span v-if="activeMode === 'lineSegment'" class="outer">
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            class="inner"
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleClickLineDelete()">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-dialog
                            v-model="dialogLine"
                            width="50vh"
                            height="100vh"
                            @keydown.enter="handleOnLineDelete"
                            @keydown.esc="dialog = false"
                        >
                            <v-card>
                                <v-card-title class="headline grey lighten-2">
                                    Are you sure you want to delete this line?
                                </v-card-title>

                                <v-divider></v-divider>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="primary"
                                        text
                                        @click="handleOnLineDelete"
                                    >
                                        Yes
                                    </v-btn>
                                    <v-btn
                                        color="primary"
                                        text
                                        @click="dialogLine = false"
                                    >
                                        Cancel
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </template>
                    <span>Delete</span>
                </v-tooltip>
            </span>
        </v-toolbar>
    </v-card>
</template>

<script>
    import axios from 'axios';
    import FileSaver from 'file-saver';

    export default {
        created() {
            this.$root.$refs.Toolbar = this;
        },
        component: {
            axios
            ,FileSaver
        },
        watch: {
            dialog: function(val) {
                //if dialog is open then we want to switch off the keylisten
                this.$store.dispatch('changeKeyListen', !val);
            },
            dialogLine: function(val) {
                //if dialog is open then we want to switch off the keylisten
                this.$store.dispatch('changeKeyListen', !val);
            },
            dialogCamera: function(val) {
                this.$store.dispatch('changeKeyListen', !val);
            },
            dialogCameraImage: function(val) {
                this.$store.dispatch('changeKeyListen', !val);
            },
            dialogCameraConfirm: function(val) {
                this.$store.dispatch('changeKeyListen', !val);
            }
        },
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
            }
        },
        props: {

        },
        data: () => ({
            dialog: false
            ,dialogLine: false
            ,dialogCamera: false
            ,dialogCameraImage: false
            ,dialogCameraConfirm: false
            ,currentSelection: {label: ""}
            ,currentPicture: ""
        }),
        methods: {
            handleCameraImageOpen() {
                this.dialogCameraImage = true;
            },
            handleCameraConfirm() {
                this.dialogCameraConfirm = true;
            },
            handleCameraConfirmTakePicture() {
                this.dialogCameraConfirm = false;
                this.handleClickCamera();
            },
            handleClickDelete() {
                this.dialog = true;
            },
            handleOnDelete() {
                this.dialog = false;

                this.$root.$refs.Map.deleteMarker(this.activeMarker);
            },
            handleClickAddLine() {
                console.log(this.currentSelection);
                let toConnectMarker = {};
                for(let i in this.markers) {
                    if(this.markers[i].label === this.currentSelection.label) {
                        toConnectMarker = this.markers[i];
                    }
                }
                this.$root.$refs.Map.addNewSegment(this.activeMarker, toConnectMarker);
            },
            handleKeepPhoto() {
                let payload = {
                    marker: this.activeMarker
                    ,picture: this.currentPicture
                };
                this.$store.dispatch('updateMarkerPicture', payload);
                this.dialogCamera = false;
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

                let response = await axios.post("http://localhost:5000/downloadPhoto", {fileUrl: this.activeMarker.picture}, {responseType: "blob"});

                console.log(response);
                var fileURL = window.URL.createObjectURL(new Blob([response.data]));
                var fileLink = document.createElement('a');

                fileLink.href = fileURL;
                fileLink.setAttribute('download', filename);
                document.body.appendChild(fileLink);

                fileLink.click();
                this.$store.dispatch('changeLoading', false);
                
            },
            async handleRetakePhotoFromImage() {
                this.dialogCameraImage = false;
                await this.takePicture();
                this.dialogCamera = true;
            },
            async handleRetakePhoto() {
                this.dialogCamera = false;
                await this.takePicture();
                this.dialogCamera = true;
            },
            async handleClickCamera() {
                
                await this.takePicture();
                console.log(this.currentPicture);
                this.dialogCamera = true;
            },
            async takePicture() {
                this.$store.dispatch('changeLoading', true);
                let response = await axios.post("http://localhost:5000/takePicture");
                console.log(response);
                let pictureId = response["data"]["id"];
                let pictureStatus = await this.waitForFunction(pictureId);
                console.log(pictureStatus);
                this.currentPicture = pictureStatus["results"]["fileUrl"];
                this.$store.dispatch('changeLoading', false);
            },
            async waitForFunction(pictureId) {
                //while loop to wait for the status of the picture to finish
                let whileLoopStatus = false;
                let statusResponse = {};
                while(!whileLoopStatus) {
                    await new Promise(r => setTimeout(r, 2000));
                    statusResponse = await axios.post("http://localhost:5000/pictureStatus", {id: pictureId});
                    console.log(statusResponse);
                    if(statusResponse["data"]["state"] === "done") {
                        // var headers = statusResponse.headers();
                        // var blob = new Blob([statusResponse.data],{type:headers['content-type']});
                        // var link = document.createElement('a');
                        // link.href = window.URL.createObjectURL(blob);
                        // link.download = "Filename";
                        // link.click();
                        whileLoopStatus = true;
                    }
                }
                console.log("Done Waiting");
                return statusResponse["data"];
            },
            handleClickLineDelete() {
                this.dialogLine = true;
            },
            handleOnLineDelete() {
                this.dialogLine = false;
                this.$root.$refs.Map.deleteLineSegment(this.activeMarker);
            },
            handleChangeMode(mode) {
                this.$store.dispatch('changeMode', mode);
            },
        }
    }
</script>

<style scoped>
    .outer {
        width:100;
        text-align: right;
    }
    .inner {
        display: inline-block;
    }
    .cameraPicture {
        text-align: center;
    }
</style>