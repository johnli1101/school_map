<template>
    <v-card
        dark
        flat
        tile
        bottom
    >
        <v-toolbar extended>
            <!-- Addition Mode Toggle -->
            <span v-if="additionMode === 'addMarker'">
                <v-tooltip top>
                    <template v-slot:activator="{ on1, attrs1 }">
                        <v-btn 
                            icon
                            v-bind="attrs1"
                            v-on="on1" 
                            @click="handleChangeMode('')">
                            <v-icon>mdi-plus-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>Addition Mode Off</span>
                </v-tooltip>
            </span>
            <span v-else>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleChangeMode('addMarker')">
                            <v-icon>mdi-plus-thick</v-icon>
                        </v-btn>
                    </template>
                    <span>Addition Mode On</span>
                </v-tooltip>
            </span>
            <!-- Add Connected Marker Toggle -->
            <span v-if="additionMode === 'addConnectedMarker'">
                <v-tooltip top>
                    <template v-slot:activator="{ on1, attrs1 }">
                        <v-btn 
                            icon
                            v-bind="attrs1"
                            v-on="on1" 
                            @click="handleChangeMode('')">
                            <v-icon>mdi-pencil-plus-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>Add Connected Marker Off</span>
                </v-tooltip>
            </span>
            <span v-else>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleChangeMode('addConnectedMarker')">
                            <v-icon>mdi-pencil-plus</v-icon>
                        </v-btn>
                    </template>
                    <span>Add Connected Marker On</span>
                </v-tooltip>
            </span>
            <!-- Line Add Toggle -->
            <span v-if="additionMode === 'lineAdd'">
                <v-tooltip top>
                    <template v-slot:activator="{ on1, attrs1 }">
                        <v-btn 
                            icon
                            v-bind="attrs1"
                            v-on="on1" 
                            @click="handleChangeMode('')">
                            <v-icon>mdi-card-plus-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>Line Add Mode Off</span>
                </v-tooltip>
            </span>
            <span v-else>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleChangeMode('lineAdd')">
                            <v-icon>mdi-card-plus</v-icon>
                        </v-btn>
                    </template>
                    <span>Line Add Mode On</span>
                </v-tooltip>
            </span>
            <v-toolbar-title>
                <span v-if="activeMode === 'marker'">
                    Marker: {{activeMarker.label}}
                </span>
                <span v-else-if="activeMode === 'lineSegment'">
                    Line Segment: {{activeMarker.pt1}} to {{activeMarker.pt2}}
                </span>
                <span v-else>
                
                </span>
            </v-toolbar-title>
        
            <v-spacer></v-spacer>
            <span v-if="activeMode === 'marker' && Object.keys(activeMarker).length !== 0" class="outer">
                <!-- Camera Image Preview -->
                <SchoolMapCameraContainer />
                <!-- Delete Prompt -->
                <SchoolMapDeleteConfirm />
            </span>
            <span v-if="activeMode === 'lineSegment'" class="outer">
                <!-- Delete Line Segment -->
                <SchoolMapLineDeleteConfirm />
            </span>
        </v-toolbar>
    </v-card>
</template>

<script>

    import SchoolMapDeleteConfirm from './delete_dialogs/SchoolMapDeleteConfirm';
    import SchoolMapLineDeleteConfirm from './delete_dialogs/SchoolMapLineDeleteConfirm';
    import SchoolMapCameraContainer from './SchoolMapCameraContainer';

    export default {
        created() {
            this.$root.$refs.Toolbar = this;
        },
        components: {
            SchoolMapLineDeleteConfirm,
            SchoolMapDeleteConfirm,
            SchoolMapCameraContainer
        },
        watch: {
            dialog: function(val) {
                //if dialog is open then we want to switch off the keylisten
                this.$store.dispatch('changeKeyListen', !val);
            },
            dialogLine: function(val) {
                //if dialog is open then we want to switch off the keylisten
                this.$store.dispatch('changeKeyListen', !val);
            },
        },
        computed: {
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
        },
        props: {

        },
        data: () => ({
            currentSelection: {label: ""}
            ,mapBounds: [[0, 0], [1612.8, 806.4]]  //[5376, 2688]
        }),
        methods: {
            calculateCenter() {
                return [this.mapBounds[0] / 2, this.mapBounds[1] / 2];
            },
            handleClickAddLine() {
                console.log(this.currentSelection);
                let toConnectMarker = {};
                for(let i in this.markers) {
                    if(this.markers[i].label === this.currentSelection.label) {
                        toConnectMarker = this.markers[i];
                    }
                }
                this.$root.$refs.Map.addNewSegment(this.activeMarker, toConnectMarker);
            },
            handleChangeMode(mode) {
                this.$store.dispatch('changeMode', mode);
            },
        }
    }
</script>

<style scoped>
    .outer {
        width:100;
        text-align: right;
    }
    .inner {
        display: inline-block;
    }
    .cameraPicture {
        text-align: center;
    }
</style>