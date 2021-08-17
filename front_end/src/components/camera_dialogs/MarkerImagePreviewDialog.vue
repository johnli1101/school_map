<template>
    <v-dialog
        v-model="dialogImageMarkerPreview"
        width="150vh"
        height="150vh"
        @keydown.esc="handleCloseImageMarkerPrev()"
        @click:outside="handleCloseImageMarkerPrev()"
    >
        <v-card>
            <v-card-title class="headline grey lighten-2">
                Image Marker: {{activeImageMarker.label}}
            </v-card-title>
            <embed
                v-if="fileType === 'pdf'"
                class="pdf-class"
                type="video/webm"
                :src="getImageMarkerPicture()"
            />
            <a v-else-if="checkFileType(this.activeImageMarker.picture) === 'url'" :href="this.activeImageMarker.picture">{{ this.activeImageMarker.picture }}</a>
            <v-img
                v-else
                class="cameraPicture"
                :src="getImageMarkerPicture()"
                lazy-src=""
                max-width="1200"
                max-height="650"
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
                    @click="handleUploadNewImage()"
                >
                    Upload New Image
                </v-btn>
                <v-btn
                    color="primary"
                    text
                    @click="handleDeleteMarker()"
                >
                    Delete Marker
                </v-btn>
                <v-btn
                    color="primary"
                    text
                    @click="handleCloseImageMarkerPrev()"
                >
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>

export default {
    created() {

    },
    components: {

    },
    data: () => ({
        fileType: ""
    }),
    computed: {
        localHostName() {
            return this.$store.state.localHostName;
        },
        activeImageMarker() {
            return this.$store.state.activeImageMarker;
        },
        dialogImageMarkerPreview() {
            return this.$store.state.dialogImageMarkerPreview;
        }
    },
    watch: {
        //use this watcher to set the file type in order to know what to display
        activeImageMarker: function () {
            let fileType = this.activeImageMarker.picture.split('.').pop();
            console.log(fileType);
            if(this.activeImageMarker.picture.match(/\b(https?:\/\/\S*\b)/g)) 
            {
                this.fileType = "url";
            }
            else {
                this.fileType = fileType;
            }
            console.log(fileType);
        }
    },
    props: {

    },
    methods: {
        //this is temp
        checkFileType(file) {
            let fileType = "";
            if(file.match(/\b(https?:\/\/\S*\b)/g)) 
            {
                fileType = "url";
            }
            return fileType
        },
        getImageMarkerPicture() {

            if(this.activeImageMarker.picture) {
                console.log(this.activeImageMarker.picture)
                let filename = this.activeImageMarker.picture.substr(this.activeImageMarker.picture.lastIndexOf('/') + 1);
                console.log(filename);
                
                return "http://" + this.localHostName + "/uploaded_assets/markers/" + filename;
            }
            return "";
        },
        handleCloseImageMarkerPrev() {
            this.$store.dispatch('changeDialogImageMarkerPreview', false);
        },
        handleUploadNewImage() {
            console.log(this.activeImageMarker.picture);
            this.$store.dispatch('updateImageVariable', true);
            this.$store.dispatch('changeDialogUploadImage', true);
        },
        handleDeleteMarker() {
            this.$store.dispatch('changeDialogImageMarkerPreview', false);
            this.$emit('delete-marker');
        }
    }
}
</script>

<style scoped>
    .pdf-class {
        max-height: 50rem; 
        min-height: 40rem;
        width: 100%;
    }
</style>