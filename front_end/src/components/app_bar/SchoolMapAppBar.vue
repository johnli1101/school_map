<template>
    <v-app-bar
          color="deep-purple accent-4"
          dark
          flat
        >
            <v-app-bar-nav-icon></v-app-bar-nav-icon>

            <v-toolbar-title>学校の地図</v-toolbar-title>

            <v-spacer></v-spacer>
            <SchoolMapSaveButton class="right-buttons"  />
            <SchoolMapClearButton class="right-buttons"  />
            <SchoolMapExport class="right-buttons" />
            <SchoolMapImport @on-import-json="importedJson($event)" class="right-buttons" />
            <SchoolMapImportMap class="right-buttons" />
            
    </v-app-bar>
</template>

<script>
    import SchoolMapImport from './SchoolMapImport';
    import SchoolMapExport from './SchoolMapExport';
    import SchoolMapImportMap from './SchoolMapImportMap';
    import SchoolMapSaveButton from './SchoolMapSaveButton';
    import SchoolMapClearButton from './SchoolMapClearButton';

    export default {
        components: {
            SchoolMapImport, SchoolMapExport, SchoolMapImportMap, SchoolMapSaveButton, SchoolMapClearButton
        },
        props: {

        },
        data: () => ({
            importedJson(coordJson) {
                console.log(coordJson);
                this.$emit("on-import-json", coordJson);
            },
        }),
        methods: {

        },
    }
</script>
<style scoped>
    .right-buttons {
        padding: 0.5vh;
    }
</style>
