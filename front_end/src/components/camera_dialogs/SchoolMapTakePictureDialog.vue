<template>
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
                <v-text-field
                    label="Degree"
                    :rules="[rules.required, rules.degreeValue]"
                    v-model="degree"
                    type="number"
                ></v-text-field>
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

<script>

export default {
    created() {
        this.$root.$refs.TakePicture = this;
    },
    data: () => ({
        rules: {
            required: value => !!value || 'Required.',
            degreeValue: value => (value <= 360.0 && value >= 0) || 'Please enter a value between 0 to 360',
            // numberRule: v  => {
            //     if (!v.trim()) return true;
            //     if (!isNaN(parseFloat(v)) && v >= 0 && v <= 999) return true;
            //     return 'Number has to be between 0 and 999';
            // },
        },
        degree: 0,
    }),
    props: {
        currentPicture: String
    },
    computed: {
        databaseLocalHost() {
            return this.$store.state.databaseLocalHost;
        },
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
    methods: {
        handleCameraDialogOff() {
            this.$store.dispatch('changeDialogCamera', false);
        },
        // uploads the photo into local directory in back_end and also saves it into the mysql database
        async handleKeepPhoto() {
            this.$store.dispatch('changeLoading', true);

            let newFilePath = "";
            await this.axios.post("http://" + this.databaseLocalHost + "/uploadCameraImage", {link: this.currentPicture}).then(response => {
                console.log(response);
                newFilePath = response["data"];
            }).catch(error => {
                console.log(error);
            });
            let tempMarker = this.activeMarker;
            tempMarker["picture"] = newFilePath;
            tempMarker["degree"] = parseFloat(this.degree)
            console.log(tempMarker);   
            await this.axios.post("http://" + this.databaseLocalHost + "/updateMarker", tempMarker).then(response => {
                console.log(response);
            }).catch(error2 => {
                console.log(error2);
            });
            let payload = {
                marker: this.activeMarker
                ,picture: newFilePath
            };
            console.log(payload);
            this.$store.dispatch('updateMarkerPicture', payload);
            payload = {
                marker: this.activeMarker
                ,degree: parseFloat(this.degree)
            }
            this.$store.dispatch('updateMarkerDegree', payload);
            this.degree = 0;
            this.$store.dispatch('changeLoading', false);
            this.$store.dispatch('changeDialogCamera', false);
        },
        handleRetakePhoto() {
            this.$store.dispatch('changeDialogCameraConfirm', true);
        },
        async handleClickCamera() {
            await this.takePicture();
            console.log(this.currentPicture);
            this.$store.dispatch('changeDialogCamera', true);
        },
    }
}
</script>

<style scoped>

</style>