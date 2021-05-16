<template>
    <div>
        <v-btn
            depressed
            color="primary"
            @click="dialog = true"
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
        prop: {

        },
        data: () => ({
            dialog: false,
            currentFile: []
        }),
        methods: {
            handleImportMap() {
                let file = this.currentFile;
                let passArgs = [];

                console.log(file);
                let imageURL = URL.createObjectURL(file);
                
                let img = new Image();
                img.onload = () => {
                    //console.log(img.width + " " + img.height);
                    passArgs[0] = imageURL;
                    passArgs[1] = img.width;
                    passArgs[2] = img.height;
                    passArgs[3] = file.name;
                    this.$emit("on-import-map", passArgs);  
                }
                img.src = imageURL;
                
                
                this.currentFile = [];

                this.dialog = false;
            },
            handleOnFileChange(file) {
                this.currentFile = file;
            }
        },
    }
</script>
