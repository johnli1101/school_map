<template>
    <div>
        <SchoolMapAppBar 
            @on-import-map="importedMap($event)" 
            @on-import-json="importedJson($event)" 
            :markers="markerList" 
            :lineSegments="lineSegmentList" 
        />
        <SchoolMapMain 
            :mapImageURL="mapImageURL" 
            :mapBounds="mapBounds" 
        />
        <SchoolMapMarkerToolbar />
    </div>
</template>

<script>
    import SchoolMapMain from './SchoolMapMain';
    import SchoolMapAppBar from './SchoolMapAppBar';
    import SchoolMapMarkerToolbar from './SchoolMapMarkerToolbar';

    export default {
        components: {
            SchoolMapMain, SchoolMapAppBar, SchoolMapMarkerToolbar
        },
        data: () => ({
            importedCoordJson: {},
            mapImageURL: require("./doushishaRyokanBldg.jpg"),
            mapBounds: [700, 1200],
            mapImageName: ""
        }),
        methods: {
            importedJson(coordJson) {
                this.importedCoordJson = coordJson;
                console.log(coordJson);
                this.$root.$refs.Map.importedJson(coordJson);
            },
            importedMap(newMapArgs) {
                this.mapBounds = [newMapArgs[2], newMapArgs[1]];
                this.mapImageURL = newMapArgs[0];
                this.mapImageName = newMapArgs[3];
                console.log(this.mapBounds + " " + this.mapImageURL);
                this.$root.$refs.Map.clearMarkers();
            }
        },
    }
</script>

<style scoped>

</style>