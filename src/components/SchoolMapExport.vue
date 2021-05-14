<template>
    <v-btn
        depressed
        color="success"
        @click="handleExport()"
    >
        Export Coordinates
    </v-btn>
</template>

<script>
//import L from 'leaflet';

export default {
    data: () => ({
        
    }),
    components: {

    },
    props: {
        markers: Array,
        lineSegments: Array
    },
    methods: {
        handleExport() {
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
            const data = JSON.stringify(newCoordJson, null, 2)
            const blob = new Blob([data], {type: 'text/plain'})
            const e = document.createEvent('MouseEvents'),
            a = document.createElement('a');
            a.download = "coordinates.json";
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
