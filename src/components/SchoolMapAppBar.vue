<template>
    <v-app-bar
          color="deep-purple accent-4"
          dark
          flat
        >
            <v-app-bar-nav-icon></v-app-bar-nav-icon>

            <v-toolbar-title>学校の地図</v-toolbar-title>

            <v-spacer></v-spacer>
            <SchoolMapExport class="right-buttons" />
            <SchoolMapImport @on-import-json="importedJson($event)" class="right-buttons" />
            <SchoolMapImportMap class="right-buttons" />
            
    </v-app-bar>
</template>

<script>
    import SchoolMapImport from './SchoolMapImport';
    import SchoolMapExport from './SchoolMapExport';
    import SchoolMapImportMap from './SchoolMapImportMap';

    export default {
        components: {
            SchoolMapImport, SchoolMapExport, SchoolMapImportMap
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
        padding: 1vh;
    }
</style>
