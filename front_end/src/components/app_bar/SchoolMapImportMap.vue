<template>
    <div>
        <v-btn
            depressed
            color="primary"
            @click="dialog = true;"
        >
            Import Map
        </v-btn>
        <v-dialog
            v-model="dialog"
            width="50vh"
            height="100vh"
        >
            <v-card>
                <v-card-title class="headline grey lighten-2">
                    Please select a map file you want to import. (It must be JPG for it to work properly)
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
                        @click="handleImportMap()"
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
        computed: {
            mapBounds() {
                return this.$store.state.mapBounds;
            },
            mapImageUrl() {
                return this.$store.state.mapImageUrl;
            },
            mapImageName() {
                return this.$store.state.mapImageName;
            }
        },
        data: () => ({
            dialog: false,
            currentFile: [],
            //filePath: ""
        }),
        methods: {
            handleImportMap() {
                let file = this.currentFile;
                //let passArgs = [];

                // const reader = new FileReader();
                // reader.addEventListener('load', e => this.filePath = e.target.result);
                // reader.addEventListener('error', e => this.filePath = this.errorImage);
                // reader.readAsDataURL(file);

                console.log(file);

                
                let imageURL = URL.createObjectURL(file);
                
                let img = new Image();
                img.onload = () => {
                    console.log(img.width + " " + img.height);

                    //this.$store.dispatch('clearAllMarkersAndSegments');
                    
                    this.updateMapDatabase(file, img);
                }
                img.src = imageURL;
                
                this.currentFile = [];

                this.dialog = false;
            },
            async updateMapDatabase(file, img) {
                this.$store.dispatch('changeLoading', true);

                //clear all markers first
                // await this.axios.post("http://localhost:5000/clear").then(response => {
                //     console.log(response);
                // }).catch(error => {
                //     console.log(error);
                // });
                
                //upload map image
                let newFilename = "";
                var data = new FormData()
                data.append('file', file);
                console.log(data);
                await this.axios.post("http://localhost:5000/uploadMap", data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(response => {
                    console.log(response);
                    newFilename = response["data"];

                }).catch(error => {
                    console.log(error);
                });
                console.log(newFilename);
                //update map
                let tempMapObj = {
                        map_image: newFilename
                        ,map_height: img.height
                        ,map_width: img.width
                    };
                await this.axios.post("http://localhost:5000/updateMap", tempMapObj).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.log(error);
                });    

                this.$store.dispatch('changeMapImageUrl', newFilename);
                this.$store.dispatch('changeMapBounds', [img.height, img.width]);

                this.$store.dispatch('changeLoading', false);
            },
            handleOnFileChange(file) {
                this.currentFile = file;
            }
        },
    }
</script>
