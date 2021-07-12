<template>
    <v-dialog
        v-model="dialogUploadImage"
        width="100vh"
        height="100vh"
        @keydown.esc="handleCloseUpload()"
        @click:outside="handleCloseUpload()"
    >
        <v-card>
            <v-card-title class="headline grey lighten-2">
                Please select an image to upload to this marker
            </v-card-title>
            <v-file-input
                label="Image Upload"
                outlined
                dense
                v-model="currentFile"
                @change="handleOnFileChange"
                ref="fileInput"
            ></v-file-input>
            <v-img
                v-if="fileUrl"
                class="cameraPicture"
                :src="fileUrl"
                lazy-src=""
                max-width="100vh"
                max-height="68vh"
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
                    @click="handleUploadImage()"
                >
                    Yes
                </v-btn>
                <v-btn
                    color="primary"
                    text
                    @click="handleCloseUpload()"
                >
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>

    export default {
        prop: {

        },
        computed: {
            activeMarker() {
                return this.$store.state.activeMarker;
            },
            activeMode() {
                return this.$store.state.activeMode;
            },
            dialogUploadImage() {
                return this.$store.state.dialogUploadImage;
            }
        },
        data: () => ({
            dialog: false,
            currentFile: [],
            fileUrl: "",
        }),
        methods: {
            handleUploadImage() {
                console.log();
                let file = this.currentFile;
                let file2 = this.currentFile;
                console.log(file);
                file = URL.createObjectURL(file);

                let img = new Image();
                img.onload = () => {

                    let payload = [file2, file];
                    this.$emit("upload-image", payload);
                    console.log("Hello");
                }
                img.src = file;
                
                this.currentFile = [];
                this.fileUrl = "";
                this.$store.dispatch('changeDialogUploadImage', false);
            },
            handleOnFileChange(event) {
                console.log(event);
                if(event !== null) {
                    this.currentfile = event;
                    this.fileUrl = URL.createObjectURL(event);
                    console.log(event);
                }
            },
            handleCloseUpload() {
                this.currentFile = [];
                this.fileUrl = "";
                this.$store.dispatch('changeDialogUploadImage', false);
                this.$emit("delete-last-marker");
            },
        },
    }
</script>
