<template>
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
</template>

<script>

export default {
    created() {
        this.$root.$refs.CameraConfirmDialog = this;
    },
    data: () => ({

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

    },
    props: {
        
    },
    methods: {
        handleCameraConfirm() {
            this.$store.dispatch('changeDialogCameraConfirm', true);
        },
        handleCameraConfirmOff() {
            this.$store.dispatch('changeDialogCameraConfirm', false);
        },
        handleCameraConfirmTakePicture() {
            this.$store.dispatch('changeDialogCameraConfirm', false);
            this.$store.dispatch('changeDialogCamera', false);
            this.$store.dispatch('changeDialogCameraPreview', false)
            this.$emit("take-picture");
        },
    }
}
</script>

<style scoped>

</style>