<template>
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
                @keydown.esc="handleCameraConfirmOff()"
                @click:outside="handleCameraConfirmOff()"
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
                            @click="handleCameraConfirmOff()"
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
                            @click="handleCameraDialogOff()"
                        >
                            Cancel
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </template>
        <span>Take a Picture</span>
    </v-tooltip>
</template>

<script>

export default {
    created() {
        this.$root.$refs.TakePicture = this;
    },
    data: () => ({
        currentPicture: "",
        currentPictureAgl:""
    }),
    mixins: [SchoolMapCameraMixin],
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
        dialogCameraConfirm() {
            return this.$store.state.dialogCameraConfirm;
        },
        dialogCamera() {
            return this.$store.state.dialogCamera;
        }
    },
    components: {

    },
    props: {
        
    },
    methods: {
        handleCameraDialogOff() {
            this.$store.dispatch('changeDialogCamera', false);
        },
        handleCameraConfirm() {
            this.$store.dispatch('changeDialogCameraConfirm', true);
        },
        handleCameraConfirmOff() {
            this.$store.dispatch('changeDialogCameraConfirm', false);
        },
        handleCameraConfirmTakePicture() {
            this.$store.dispatch('changeDialogCameraConfirm', false);
            this.handleClickCamera();
        },
        handleKeepPhoto() {
            let payload = {
                marker: this.activeMarker
                ,picture: this.currentPicture
            };
            this.$store.dispatch('updateMarkerPicture', payload);
            this.$store.dispatch('changeDialogCamera', false);
        },
        async handleRetakePhoto() {
            this.$store.dispatch('changeDialogCamera', false);
            await this.takePicture();
            this.$store.dispatch('changeDialogCamera', true);
        },
        async handleClickCamera() {
            await this.takePicture();
            console.log(this.currentPicture);
            this.$store.dispatch('changeDialogCamera', true);
        },
        async takePicture() {
            this.$store.dispatch('changeLoading', true);
            let response = await this.axios.post("http://localhost:5000/takePicture");
            console.log(response);
            let pictureId = response["data"]["id"];
            let pictureStatus = await this.waitForFunction(pictureId);
            console.log(pictureStatus);
            this.currentPicture = pictureStatus["results"]["fileUrl"];
            console.log('currentPicture', this.currentPicture);
            this.$store.dispatch('changeLoading', false);
        },
        async waitForFunction(pictureId) {
            //while loop to wait for the status of the picture to finish
            let whileLoopStatus = false;
            let statusResponse = {};
            while(!whileLoopStatus) {
                await new Promise(r => setTimeout(r, 2000));
                statusResponse = await this.axios.post("http://localhost:5000/pictureStatus", {id: pictureId});
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
    }
}
</script>

<style scoped>

</style>