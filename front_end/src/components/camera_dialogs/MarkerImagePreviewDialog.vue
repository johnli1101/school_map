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
            <v-img
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

    }),
    computed: {
        activeImageMarker() {
            return this.$store.state.activeImageMarker;
        },
        dialogImageMarkerPreview() {
            return this.$store.state.dialogImageMarkerPreview;
        }
    },
    props: {

    },
    methods: {
        getImageMarkerPicture() {

            if(this.activeImageMarker.picture) {
                let filename = this.activeImageMarker.picture.substr(this.activeImageMarker.picture.lastIndexOf('/') + 1);
                console.log(filename);
                
                return "http://localhost:8080/uploaded_assets/markers/" + filename;
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

</style>