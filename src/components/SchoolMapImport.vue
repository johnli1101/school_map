<template>
    <div>
        <v-btn
            depressed
            color="primary"
            @click="dialog = true"
        >
            Import Coordinates
        </v-btn>
        <v-dialog
            v-model="dialog"
            width="50vh"
            height="100vh"
        >
            <v-card>
                <v-card-title class="headline grey lighten-2">
                    Please select a file you want to import. (It must be Json for it to work properly)
                </v-card-title>
                <v-file-input
                    label="Map Import"
                    outlined
                    dense
                    v-model="currentFile"
                    @change="handleOnFileChange"
                ></v-file-input>
                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="handleImport()"
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
    </div>
</template>

<script>

    export default {
        watch: {
            dialog: function(val) {
                //if dialog is open then we want to switch off the keylisten
                this.$store.dispatch('changeKeyListen', !val);
            }
        },
        prop: {

        },
        data: () => ({
            dialog: false,
            currentFile: []
        }),
        methods: {
            handleImport() {
                let file = this.currentFile;
                let newCoordJson = {};
                console.log(file);
                
                let reader = new FileReader();
 
                reader.readAsText(file, "UTF-8");
                reader.onload =  evt => {
                    newCoordJson = evt.target.result;
                    console.log(newCoordJson);
                    this.$emit("on-import-json", newCoordJson);
                }
                reader.onerror = evt => {
                    console.error(evt);
                }
                this.currentFile = [];

                this.dialog = false;
            },
            handleOnFileChange(file) {
                this.currentFile = file;
            }
        },
    }
</script>
