<template>
    <div>
        <SchoolMapAppBar @on-import-json="importedJson($event)" :markers="markerList" :lineSegments="lineSegmentList" />
        <SchoolMapMain @activate-toolbar="passSignalToToolBar($event)" :activeMarker="activeMarker" :additionMode="additionMode" />
        <SchoolMapMarkerToolbar @pass-line-add-mode="passLineAddMode($event)" @pass-addition-mode="passAdditionMode($event)" @send-signal="passSignalToMap($event)" :markers="markerList" :marker="activeMarker" />
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
            additionMode: ""
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
            }
        },
    }
</script>

<style scoped>

</style>