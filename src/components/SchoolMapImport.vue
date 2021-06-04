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
                    Please select a json coordinate file to import
                </v-card-title>
                <v-file-input
                    label="Coordinates Import"
                    outlined
                    dense
                    v-model="currentFile"
                    @change="handleOnFileChange"
                ></v-file-input>
                <span v-for="(error, index) in errorArray"
                    :key="index">
                    <br>{{error}}
                </span>
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
            currentFile: [],
            errorArray: [],
        }),
        methods: {
            checkJsonIntegrity(checkJson) {
                if(checkJson["markers"] || checkJson["line_segments"]) {
                    return false;
                }

                for(let i in checkJson["markers"]) {
                    if(checkJson["markers"][i]["lat"] === undefined
                        || checkJson["markers"][i]["lng"] === undefined) {
                        return false;
                    }
                }

                return true;
            },
            handleImport() {
                let file = this.currentFile;
                let newCoordJson = {};
                console.log(file);
                
                let reader = new FileReader();

                reader.readAsText(file, "UTF-8");

                this.$store.dispatch('changeLoading', true);
                reader.onload =  evt => {
                    newCoordJson = evt.target.result;
                    console.log(newCoordJson);
                    console.log(this.checkJsonIntegrity(newCoordJson));
                    if(this.checkJsonIntegrity(newCoordJson)){
                        this.$emit("on-import-json", newCoordJson);
                    } else {
                        this.errorArray.push("Integrity of json does not match with coordinates json");
                    }
                    this.$store.dispatch('changeLoading', false);
                    
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
