<template>
    <v-card
        dark
        flat
        tile
        bottom
    >
        <v-toolbar extended>
            <v-app-bar-nav-icon></v-app-bar-nav-icon>
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
                    Marker: {{marker.label}}
                </span>
                <span v-else-if="activeMode === 'lineSegment'">
                    Line Segment: {{marker.pt1}} to {{marker.pt2}}
                </span>
            </v-toolbar-title>
            
            <v-spacer></v-spacer>
            <span v-if="activeMode === 'marker'" class="outer">
                <v-select
                    :items="markers"
                    v-model="currentSelection.label"
                    item-text="label"
                    item-value="label"
                    class="inner"
                    label="Lines Connected To"
                    outlined
                ></v-select>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            class="inner"
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleClickAddLine()">
                    <v-icon>mdi-chart-timeline-variant</v-icon>
                        </v-btn>
                    </template>
                    <span>Add New Line</span>
                </v-tooltip>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            class="inner"
                            icon
                            v-bind="attrs"
                            v-on="on" >
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                    </template>
                    <span>Edit</span>
                </v-tooltip>
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            class="inner"
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleClickDelete()">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-dialog
                            v-model="dialog"
                            width="50vh"
                            height="100vh"
                        >
                            <v-card>
                                <v-card-title class="headline grey lighten-2">
                                    Are you sure you want to delete this point?
                                </v-card-title>

                                <v-divider></v-divider>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="primary"
                                        text
                                        @click="handleOnDelete"
                                    >
                                        Yes
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
                    </template>
                    <span>Delete</span>
                </v-tooltip>
            </span>
            <span v-if="activeMode === 'lineSegment'" class="outer">
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            class="inner"
                            icon
                            v-bind="attrs"
                            v-on="on" 
                            @click="handleClickLineDelete()">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                        <v-dialog
                            v-model="dialogLine"
                            width="50vh"
                            height="100vh"
                        >
                            <v-card>
                                <v-card-title class="headline grey lighten-2">
                                    Are you sure you want to delete this line?
                                </v-card-title>

                                <v-divider></v-divider>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                        color="primary"
                                        text
                                        @click="handleOnLineDelete"
                                    >
                                        Yes
                                    </v-btn>
                                    <v-btn
                                        color="primary"
                                        text
                                        @click="dialogLine = false"
                                    >
                                        Cancel
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </template>
                    <span>Delete</span>
                </v-tooltip>
            </span>
        </v-toolbar>
    </v-card>
</template>

<script>

    export default {
        props: {
            marker: Object,
            markers: Array
        },
        watch: {
            marker: {
                deep: true,
                handler(val) {
                    //if the object does not have label then it is a line segment clicked
                    console.log(val);
                    if(val["pt1"]) {
                        this.activeMode = "lineSegment";
                    } else if (val["label"]) {
                        this.activeMode = "marker";
                    } else {
                        this.activeMode = "";
                    }
                    console.log(this.activeMode);
                }
            }
        },
        data: () => ({
            active: false
            ,dialog: false
            ,dialogLine: false
            ,additionMode: false
            ,addConnectedMark: false
            //,additionMode: ""
            ,lineAddMode: false
            ,activeMode: ""
            ,currentSelection: {label: ""}
        }),
        methods: {
            handleClickDelete() {
                this.dialog = true;
            },
            handleOnDelete() {
                this.dialog = false;

                this.$root.$refs.Map.deleteMarker(this.marker);
            },
            handleClickAddLine() {
                console.log(this.currentSelection);
                let toConnectMarker = {};
                for(let i in this.markers) {
                    if(this.markers[i].label === this.currentSelection.label) {
                        toConnectMarker = this.markers[i];
                    }
                }
                this.$root.$refs.Map.addNewSegment(this.marker, toConnectMarker);
            },
            handleClickLineDelete() {
                this.dialogLine = true;
            },
            handleOnLineDelete() {
                this.dialogLine = false;
                this.$root.$refs.Map.deleteLineSegment(this.marker);
            },
            handleChangeMode(mode) {
                this.additionMode = mode;
                this.$emit("pass-addition-mode", mode);
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
</style>