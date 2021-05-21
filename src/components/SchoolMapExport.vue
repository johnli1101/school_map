<template>
    <div>
        <v-btn
            depressed
            color="success"
            @click="dialog = true"
        >
            Export Coordinates
        </v-btn>
        <v-dialog
            v-model="dialog"
            width="50vh"
            height="100vh"
        >
            <v-card>
                <v-card-title class="headline grey lighten-2">
                    How do you want it exported?
                </v-card-title>
                <v-card-text>
                    For User: will not include the map information
                    <br/>For App: will include the map information
                </v-card-text>
                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="handleExportForUser()"
                    >
                        For User
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        @click="handleExportForApp()"
                    >
                        For App
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
    </div>
</template>

<script>
//import L from 'leaflet';

export default {
    data: () => ({
        dialog: false
    }),
    computed: {
        markers() {
            return this.$store.state.markers;
        },
        lineSegments() {
            return this.$store.state.lineSegments;
        },
        mapBounds() {
            return this.$store.state.mapBounds;
        },
        mapImageURL() {
            return this.$store.state.mapImageURL;
        },
        mapImageName() {
            return this.$store.state.mapImageName;
        }
    },
    components: {

    },
    props: {
        
    },
    methods: {
        handleExportForUser() {
            console.log(this.markers);
            console.log(this.lineSegments);

            let newCoordJson = {markers: [], line_segments: {}};

            //gather all the marker points
            for(let i = 0; i < this.markers.length; ++i) {
                newCoordJson["markers"].push({
                        label: this.markers[i].label
                        ,lat: this.markers[i].lat
                        ,lng: this.markers[i].lng
                })
            }

            //gather all the line segments
            for(let i = 0; i < this.lineSegments.length; ++i) {
                newCoordJson["line_segments"][(i+1)] = [
                        this.lineSegments[i].pt1
                        ,this.lineSegments[i].pt2
                ];
            }
            
            console.log(newCoordJson);
            exportJson(newCoordJson, "coordinates");
        },
        handleExportForApp() {
            console.log(this.markers);
            console.log(this.lineSegments);

            let newCoordJson = {markers: [], line_segments: {}};

            //gather all the marker points
            for(let i = 0; i < this.markers.length; ++i) {
                newCoordJson["markers"].push({
                        label: this.markers[i].label
                        ,lat: this.markers[i].lat
                        ,lng: this.markers[i].lng
                })
            }

            //gather all the line segments
            for(let i = 0; i < this.lineSegments.length; ++i) {
                newCoordJson["line_segments"][(i+1)] = [
                        this.lineSegments[i].pt1
                        ,this.lineSegments[i].pt2
                ];
            }

            //newCoordJson["map_file_path"] = 
            
            console.log(newCoordJson);
            exportJson(newCoordJson, "coordinates");
        },
        exportJson(toExportJson, fileName) {
            const data = JSON.stringify(toExportJson, null, 2)
            const blob = new Blob([data], {type: 'text/plain'})
            const e = document.createEvent('MouseEvents'),
            a = document.createElement('a');
            a.download = fileName;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        }
    }
}
</script>

<style scoped>
</style>
