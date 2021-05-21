<template>
    <div>
        <SchoolMapAppBar 
            @on-import-json="importedJson($event)" 
        />
        <SchoolMapMain />
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
        }),
        methods: {
            importedJson(coordJson) {
                this.importedCoordJson = coordJson;
                console.log(coordJson);
                this.$root.$refs.Map.importedJson(coordJson);
            },
        },
    }
</script>

<style scoped>

</style>