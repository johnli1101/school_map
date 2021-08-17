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
            <v-radio-group
                v-model="fileRadio"
                mandatory
                row
                @change="handleRadioChange()"
            >
                <v-radio
                    label="File Upload"
                    value="file"
                ></v-radio>
                <v-radio
                    label="Url Upload"
                    value="url"
                ></v-radio>
            </v-radio-group>
            <v-file-input
                label="Image Upload"
                outlined
                dense
                v-model="currentFile"
                @change="handleOnFileChange"
                ref="fileInput"
                v-if="fileRadio === 'file'"
            ></v-file-input>
            <v-row v-else-if="fileRadio === 'url'">
                <v-text-field
                    label="Regular"
                    placeholder="URL to Image"
                    v-model="fileInput"
                ></v-text-field>
            </v-row>
            <v-img
                v-if="(fileType === 'image' && fileUrl)"
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
            <embed
                v-if="fileType === 'application' && fileUrl"
                class="pdf-class"
                type="video/webm"
                :src="fileUrl"

            />
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
            fileType: "",
            fileRadio: "",
            fileInput: "",
        }),
        methods: {
            handleUploadImage() {
                
                let currentFileTemp = this.currentFile;
                if(this.fileRadio === "file") {
                    if(this.fileType === "image") {
                        let file = URL.createObjectURL(this.currentFile);
                        console.log(file);
                        let img = new Image();
                        img.onload = () => {

                            this.$emit("upload-image", currentFileTemp);
                            console.log("Hello");
                        }
                        img.src = file;
                    }
                    else if(this.fileType === "application") {
                        this.$emit("upload-image", currentFileTemp);
                    }
                }
                else if(this.fileRadio === "url") {
                    console.log("I'm in!");
                    this.$emit("upload-image-url", this.fileInput);
                }
                this.currentFile = null;
                this.fileUrl = "";
                this.fileType = "";
                this.fileInput = "";
                this.$store.dispatch('changeDialogUploadImage', false);
            },
            handleRadioChange(event) {
                console.log(event);
            },
            handleOnFileChange(event) {
                console.log(event);
                if(event !== null) {
                    this.currentfile = event;
                    this.fileUrl = URL.createObjectURL(event);
                    this.fileType = this.currentFile["type"].split("/")[0];

                    console.log(event);
                }
            },
            handleCloseUpload() {
                this.currentFile = null;
                this.fileUrl = "";
                this.fileType = "";
                this.fileInput = "";
                this.$store.dispatch('changeDialogUploadImage', false);
                this.$emit("delete-last-marker");
            },
        },
    }
</script>

<style scoped>
    .pdf-class {
        max-height: 50rem; 
        min-height: 40rem;
        width: 100%;
    }
</style>