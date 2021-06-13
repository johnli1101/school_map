<template>
    <span>
        <span v-if="!activeMarker.picture">
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
                </template>
                <span>Take a Picture</span>
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
                        @click="handleCameraImageOpen()">
                        <v-icon>mdi-camera-image</v-icon>
                    </v-btn>
                </template>
                <span>Preview Marker Image</span>
            </v-tooltip>
        </span>
        <SchoolMapTakePictureDialog :currentPicture="currentPicture" @retake-picture="handleRetakePicture()" />
        <SchoolMapCameraConfirmDialog @take-picture="handleTakePicture()" />
        <SchoolMapImagePreviewDialog @retake-picture-preview="handleRetakePicturePreview()" />
    </span>
</template>

<script>

import SchoolMapTakePictureDialog from './camera_dialogs/SchoolMapTakePictureDialog';
import SchoolMapCameraConfirmDialog from './camera_dialogs/SchoolMapCameraConfirmDialog';
import SchoolMapImagePreviewDialog from './camera_dialogs/SchoolMapImagePreviewDialog';

export default {
    created() {
        this.$root.$refs.CameraContainer = this;
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
        dialogCameraConfirm() {
            return this.$store.state.dialogCameraConfirm;
        },
        dialogCamera() {
            return this.$store.state.dialogCamera;
        }
    },
    components: {
        SchoolMapTakePictureDialog
        ,SchoolMapCameraConfirmDialog
        ,SchoolMapImagePreviewDialog
    },
    props: {
        
    },
    methods: {
        handleCameraConfirm() {
            this.$store.dispatch('changeDialogCameraConfirm', true);
        },
        handleCameraImageOpen() {
            this.$store.dispatch('changeDialogCameraPreview', true);    
        },
        async handleTakePicture() {
            await this.takePicture();
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
            console.log(this.currentPicture);
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