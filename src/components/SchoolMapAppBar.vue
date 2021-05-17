<template>
    <v-app-bar
          color="deep-purple accent-4"
          dark
          flat
        >
            <v-app-bar-nav-icon></v-app-bar-nav-icon>

            <v-toolbar-title>学校の地図</v-toolbar-title>

            <v-spacer></v-spacer>
            <SchoolMapExport 
                @pass-mode="passMode($event)"
                :markers="markers" 
                :lineSegments="lineSegments" 
                :additionMode="additionMode"    
            />
            <SchoolMapImport @on-import-json="importedJson($event)" />
            <SchoolMapImportMap @on-import-map="importedMap($event)" />
            
            <v-btn icon>
                <v-icon>mdi-heart</v-icon>
            </v-btn>

            <v-btn icon>
                <v-icon>mdi-magnify</v-icon>
            </v-btn>
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
            markers: Array
            ,lineSegments: Array
            ,additionMode: String
        },
        data: () => ({
            importedJson(coordJson) {
                console.log(coordJson);
                this.$emit("on-import-json", coordJson);
            },
            importedMap(newMapArgs) {
                console.log(newMapArgs);
                this.$emit("on-import-map", newMapArgs);
            },
            passMode(mode) {
                this.$emit("pass-mode", mode);
            }
        }),
        methods: {

        },
    }
</script>
