<template>
    <div>
        <SchoolMapAppBar 
            @on-import-map="importedMap($event)" 
            @on-import-json="importedJson($event)" 
            :markers="markerList" 
            :lineSegments="lineSegmentList" 
        />
        <SchoolMapMain 
            @change-mode="passAdditionMode($event)" 
            @activate-toolbar="passSignalToToolBar($event)" 
            :mapImageURL="mapImageURL" 
            :mapBounds="mapBounds" 
            :activeMarker="activeMarker" 
            :additionMode="additionMode" 
        />
        <SchoolMapMarkerToolbar 
            @pass-line-add-mode="passLineAddMode($event)" 
            @pass-addition-mode="passAdditionMode($event)" 
            @send-signal="passSignalToMap($event)" 
            @pass-mode="passAdditionMode($event)"
            :markers="markerList" 
            :marker="activeMarker" 
            :additionMode="additionMode"
        />
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
            activeMarker: {},
            markerList: [],
            lineSegmentList: [],
            importedCoordJson: {},
            additionMode: "",
            mapImageURL: require("./doushishaRyokanBldg.jpg"),
            mapBounds: [700, 1200],
            mapImageName: ""
        }),
        methods: {
            passSignalToToolBar(args) {
                this.activeMarker = args[0];
                if(args[1]) {
                    this.markerList = args[1];
                }
                if(args[2]) {
                    this.lineSegmentList = args[2];
                }
            },
            passAdditionMode(mode) {
                this.additionMode = mode;
            },
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