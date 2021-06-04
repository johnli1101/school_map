<template>
    <div>
        <v-btn
            depressed
            color="success"
            @click="dialog = true"
        >
            Export Coordinates
        </v-btn>
        <v-dialog
            v-model="dialog"
            width="50vh"
            height="100vh"
        >
            <v-card>
                <v-card-title class="headline grey lighten-2">
                    How do you want it exported?
                </v-card-title>
                <v-card-text>
                    For User: will not include the map information
                    <br/>For App: will include the map information
                    <v-text-field
                        label="Legal first name*"
                        v-model="exportFilename"
                    ></v-text-field>
                    <span v-for="(error, index) in errorArray"
                            :key="index">
                        <br>{{error}}
                    </span>
                </v-card-text>
                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="handleExportForUser()"
                    >
                        For User
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        @click="handleExportForApp()"
                    >
                        For App
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
//import L from 'leaflet';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import FileSaver from 'file-saver';
import axios from 'axios';

export default {
    watch: {
        dialog: function(val) {
            //if dialog is open then we want to switch off the keylisten
            this.$store.dispatch('changeKeyListen', !val);
        }
    },
    data: () => ({
        dialog: false
        ,exportFilename: "coordinates"
        ,errorArray: []
    }),
    computed: {
        markers() {
            return this.$store.state.markers;
        },
        lineSegments() {
            return this.$store.state.lineSegments;
        },
        activeMarker() {
            return this.$store.state.activeMarker;
        },
        mapBounds() {
            return this.$store.state.mapBounds;
        },
        mapImageURL() {
            return this.$store.state.mapImageURL;
        },
        mapImageName() {
            return this.$store.state.mapImageName;
        }
    },
    components: {
        
    },
    props: {
        
    },
    methods: {
        errorCheck(errorChecks) {
            this.errorArray = [];
            if(!this.exportFilename) {
                this.errorArray.push("Name cannot be empty");
            }
            console.log(this.errorArray.length > 0);
            console.log(this.errorArray);
            console.log(this.exportFilename);

            //check for image if "image"
            if(errorChecks === "picture") {
                let markersWOImage = [];
                for(let i = 0; i < this.markers.length; ++i) {
                    if(!this.markers[i].picture) {
                        markersWOImage.push(this.markers[i].label);
                    }
                }
                if(markersWOImage.length > 0) {
                    this.errorArray.push("The following markers are still missing images: " + markersWOImage.join(', '));
                }
            }

            return (this.errorArray.length > 0) ? true : false;
        },
        async urlToPromise(url) {
            return await new Promise(function(resolve, reject) {
                JSZipUtils.getBinaryContent(url, function (err, data) {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        },
        async handleZipImages() {
            // var img = JSZip.folder("images");
            // img.file("img.png", this.markers[i].picture);

            // for (i = 0; i < this.markers.length; i++) {
            //     img.file("img.png", this.markers[i].picture);
            // }
            // JSZip.generateAsync({
            //     type: "blob"
            // }).then(function(content) {
            //     saveAs(content, "img_archive.zip")
            // });

            // Fetch the image and parse the response stream as a blob
            console.log(this.activeMarker.picture);
            let picturetest = this.activeMarker.picture;
            const imageBlob = await axios.post("http://localhost:5000/downloadPhoto2", {fileUrl: picturetest}, {responseType: "blob"});

            // create a new file from the blob object
            const imgData = new File([imageBlob], 'filename.jpg');

            // Copy-pasted from JSZip documentation
            var zip = new JSZip();
            zip.file('Hello.txt', 'Hello World\n');
            var img = zip.folder('images');
            img.file('filename.jpg', imgData, { base64: true });
            zip.generateAsync({ type: 'blob' }).then(function(content) {
            FileSaver.saveAs(content, 'example.zip');
            });

            // let filename = "test_image.jpg";
            // let url = this.markers[0].picture;
            
            // var zip = new JSZip();
            // console.log("Hello")
            // await zip.file(filename, this.urlToPromise(url), {binary:true});
            // console.log("Done");
            // await zip.generateAsync({type:"blob"})
            // .then(function callback(blob) {

            //     // see FileSaver.js
            //     FileSaver.saveAs(blob, "example.zip");
            // });
        },
        handleExportForUser() {
            if(!this.errorCheck("picture")) {
                console.log(this.markers);
                console.log(this.lineSegments);

                let newCoordJson = {markers: {}, line_segments: {}};
                let tempMarkerObject = {};
                let filename = "";

                //gather all the marker points
                for(let i = 0; i < this.markers.length; ++i) {
                    filename = this.markers[i].picture.substr(this.markers[i].picture.lastIndexOf('/') + 1);
                    newCoordJson["markers"][filename] = [
                                    this.markers[i].lat
                                    ,this.markers[i].lng
                                ];
                    tempMarkerObject[this.markers[i].label] = filename;
                }

                //gather all the line segments
                for(let i = 0; i < this.lineSegments.length; ++i) {
                    newCoordJson["line_segments"][(i+1)] = [
                                tempMarkerObject[this.lineSegments[i].pt1]
                                ,tempMarkerObject[this.lineSegments[i].pt2]
                            ];
                }
                
                console.log(newCoordJson);
                
                this.zipFiles(newCoordJson);
            }
        },
        async zipFiles(newCoordJson) {
            this.$store.dispatch('changeLoading', true);
            const data = JSON.stringify(newCoordJson, null, 2)
            console.log(data);
            
            let zip = new JSZip();
            let zipFilename = this.exportFilename;

            //zip all the files
            for(let i = 0; i < this.markers.length; ++i) {
                let pictureFilename = this.markers[i].picture.substr(this.markers[i].picture.lastIndexOf('/') + 1);
                console.log(pictureFilename);
                console.log(this.markers[i].picture);
                
                //zip.folder(this.exportFilename).file('coordinates.json', data)
                let pictureData = await axios.post("http://localhost:5000/downloadPhoto", {fileUrl: this.markers[i].picture}, {responseType: "blob"});
                zip.file(pictureFilename, new Blob([pictureData.data]));
            }
            //zip.file(pictureFilename, pictureData.data, {binary: true});
            zip.file('coordinates.json', data);
            zip.generateAsync({type:'blob'}) 
                .then(function(blob){ 
                    FileSaver.saveAs(blob, zipFilename + ".zip"); 
                })
            this.$store.dispatch('changeLoading', false);
        },
        handleExportForApp() {
            if(!this.errorCheck()) {
                console.log(this.markers);
                console.log(this.lineSegments);

                let newCoordJson = {markers: {}, line_segments: {}};

                //gather all the marker points
                for(let i = 0; i < this.markers.length; ++i) {
                    newCoordJson["markers"][this.markers[i].label] = {
                            picture: ""
                            ,lat: this.markers[i].lat
                            ,lng: this.markers[i].lng
                    }
                }

                //gather all the line segments
                for(let i = 0; i < this.lineSegments.length; ++i) {
                    newCoordJson["line_segments"][(i+1)] = [
                            this.lineSegments[i].pt1
                            ,this.lineSegments[i].pt2
                    ];
                }

                //newCoordJson["map_file_path"] = 
                
                console.log(newCoordJson);
                this.exportJson(newCoordJson, this.exportFilename);
            }
        },
        exportJson(toExportJson, fileName) {
            const data = JSON.stringify(toExportJson, null, 2)
            const blob = new Blob([data], {type: 'text/plain'})
            const e = document.createEvent('MouseEvents'),
            a = document.createElement('a');
            a.download = fileName + ".json";
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        }
    }
}
</script>

<style scoped>
</style>
