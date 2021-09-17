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
            @click:outside="handleDialogOff()"
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
                            :key="index"
                            class="errorText">
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
                        @click="handleDialogOff()"
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
        },
        databaseLocalHost() {
            return this.$store.state.databaseLocalHost;
        },
        localHostName() {
            return this.$store.state.localHostName;
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
                this.checkPicture();
                this.checkIfMarkerIsConencted();
            }

            return (this.errorArray.length > 0) ? true : false;
        },
        handleDialogOff() {
            this.errorArray = [];
            this.dialog = false;
        },
        checkPicture() {
            let markersWOImage = [];
            for(let i = 0; i < this.markers.length; ++i) {
                if(!this.markers[i].picture) {
                    markersWOImage.push(this.markers[i].label);
                }
            }
            if(markersWOImage.length > 0) {
                this.errorArray.push("The following markers are still missing images: " + markersWOImage.join(', '));
            }
        },
        //for error checking if the given marker is connected to another marker by line segment
        checkIfMarkerIsConencted() {
            let allLineMarkers = [];
            let allMarkers = [];

            for(let i = 0; i < this.lineSegments.length; ++i) {
                if(allLineMarkers.indexOf(this.lineSegments[i].pt1) === -1) {
                    allLineMarkers.push(this.lineSegments[i].pt1);
                }
                if(allLineMarkers.indexOf(this.lineSegments[i].pt2) === -1) {
                    allLineMarkers.push(this.lineSegments[i].pt2);
                }
            }
            console.log(allLineMarkers);

            for(let i = 0; i < this.markers.length; ++i) {
                allMarkers.push(this.markers[i].label);
            }

            var filteredArray = allMarkers.filter(function(item){
                return allLineMarkers.indexOf(item) === -1; 
            });

            console.log(filteredArray);
            
            if(filteredArray.length > 0) {
                this.errorArray.push("The following markers are not connected: " + filteredArray.join(', '));
            }
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
            const imageBlob = await axios.post("http://" + this.databaseLocalHost + "/downloadPhoto2", {fileUrl: picturetest}, {responseType: "blob"});

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
                let tempLineObject = {};
                let newLineObject = {};
                let newMarkerObject = {};
                let tempImageMarkerArr = [];
                let tempInfoArray = [];
                let tempUrlArray = [];



                //gather all the marker points
                for(let i = 0; i < this.markers.length; ++i) {

                    filename = this.markers[i].picture.substr(this.markers[i].picture.lastIndexOf('/') + 1);
                    newMarkerObject[filename] = [
                            this.markers[i].lat
                            ,this.markers[i].lng
                            ,this.markers[i].degree
                        ];

                    tempInfoArray = [];
                    tempUrlArray = [];
                    for(let j = 0; j < this.markers[i]["pictureMarkers"].length; ++j) {
                        tempImageMarkerArr = [
                                this.markers[i]["pictureMarkers"][j].picture
                                ,this.markers[i]["pictureMarkers"][j].lat
                                ,this.markers[i]["pictureMarkers"][j].lng
                            ];
                        //let regEx = /\b(https?:\/\/\S*\b)/g;
                        //console.log(str.match(regEx));
                        if(this.markers[i]["pictureMarkers"][j].picture.match(/\b(https?:\/\/\S*\b)/g)) 
                        {
                            // console.log("Hello");
                            // newMarkerObject[filename]["URL"].push(tempImageMarkerArr);
                            tempUrlArray.push(tempImageMarkerArr);
                        } else 
                        {
                            // console.log("I'm info");
                            // newMarkerObject[filename]["info"].push(tempImageMarkerArr);
                            tempInfoArray.push(tempImageMarkerArr);
                        }
                    }
                    if( tempUrlArray.length > 0) {
                        newMarkerObject[filename].push({"URL": tempUrlArray});
                    }
                    if( tempInfoArray.length > 0) {
                        newMarkerObject[filename].push({"Info": tempInfoArray});
                    }
                    console.log(newMarkerObject);
                    tempMarkerObject[this.markers[i].label] = filename;
                    tempLineObject[this.markers[i].label] = [];
                }

                //create a new return array for line segments in accordance to the format requests
                console.log("next");
                for(let i = 0; i < this.lineSegments.length; ++i) {
                    let index1 = this.lineSegments[i].pt1;
                    let index2 = this.lineSegments[i].pt2
                    if(tempLineObject[index1].indexOf(index2) === -1) {
                        tempLineObject[index1].push(index2);
                    }
                    if(tempLineObject[index2].indexOf(index2) === -1) {
                        tempLineObject[index2].push(index1);
                    }
                }

                //gather all the line segments
                for(let i in tempLineObject) {
                    console.log(i);
                    console.log(tempLineObject[i].length);
                    newLineObject[tempMarkerObject[i]] = [];
                    for(let j = 0; j < tempLineObject[i].length; ++j) {
                        console.log(tempLineObject[i][j]);
                        newLineObject[tempMarkerObject[i]].push(tempMarkerObject[tempLineObject[parseInt(i)][j]]);
                    }
                }

                newCoordJson["markers"] = newMarkerObject;
                newCoordJson["line_segments"] = newLineObject;
                console.log(newCoordJson);
                
                this.zipFiles(newCoordJson);

                this.dialog = false;
            }
        },
        async zipFiles(newCoordJson) {
            this.$store.dispatch('changeLoading', true);
            console.log(newCoordJson);
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
                let pictureUrl = "http://" + this.localHostName + "/uploaded_assets/camera/" + pictureFilename;
                let pictureData = await axios.post("http://" + this.databaseLocalHost + "/downloadPhoto", {fileUrl: pictureUrl}, {responseType: "blob"});
                zip.file("Images/" + pictureFilename, new Blob([pictureData.data]));

                for(let j = 0; j < this.markers[i]["pictureMarkers"].length; ++j) {
                    let imageMarkerFilename = this.markers[i]["pictureMarkers"][j]["picture"].substr(this.markers[i]["pictureMarkers"][j]["picture"].lastIndexOf('/') + 1);
                    let imageMarkerUrl = "http://" + this.localHostName + "/uploaded_assets/markers/" + imageMarkerFilename;
                    let fileExtension = imageMarkerFilename.replace(/\.[^/.]+$/, "");
                    console.log(fileExtension);
                    //TODO: THIS IS TEMP!!!
                    if(!this.markers[i]["pictureMarkers"][j]["picture"].match(/\b(https?:\/\/\S*\b)/g)) 
                    {
                        let imageMarkerData = await axios.post("http://" + this.databaseLocalHost + "/downloadPhoto", {fileUrl: imageMarkerUrl}, {responseType: "blob"})
                            .then(response => {
                                console.log(response);
                                return response;

                            }).catch(error => {
                                console.log(error);
                            });
                        if(fileExtension === "pdf") {
                            zip.file("Images/" + imageMarkerFilename, new Blob([imageMarkerData.data]));
                        } else {
                            zip.file("Images/" + imageMarkerFilename, new Blob([imageMarkerData.data]));
                        }
                    }
                }
            }
            //zip.file(pictureFilename, pictureData.data, {binary: true});
            zip.file('Images/coordinates.json', data);
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
                let tempImageMarker = {};

                //gather all the marker points
                for(let i = 0; i < this.markers.length; ++i) {
                    newCoordJson["markers"][this.markers[i].label] = {
                            picture: this.markers[i].picture
                            ,lat: this.markers[i].lat
                            ,lng: this.markers[i].lng
                            ,pictureMarkers: []
                    }

                    for(let j = 0; j < this.markers[i]["pictureMarkers"].length; ++j) {
                        tempImageMarker =  {
                            label: this.markers[i]["pictureMarkers"][j].label
                            ,picture: this.markers[i]["pictureMarkers"][j].picture
                            ,lat: this.markers[i]["pictureMarkers"][j].lat
                            ,lng: this.markers[i]["pictureMarkers"][j].lng
                        };
                        newCoordJson["markers"][this.markers[i].label]["pictureMarkers"].push(tempImageMarker);
                    }
                }

                //gather all the line segments
                for(let i = 0; i < this.lineSegments.length; ++i) {
                    newCoordJson["line_segments"][(i+1)] = {
                            pt1: this.lineSegments[i].pt1
                            ,pt2: this.lineSegments[i].pt2
                            ,coord: [[this.lineSegments[i].coord[0][0], this.lineSegments[i].coord[0][1]]
                                        ,[this.lineSegments[i].coord[1][0], this.lineSegments[i].coord[1][1]]]
                    }
                }

                //newCoordJson["map_file_path"] = this.mapImageURL;
                
                console.log(newCoordJson);
                this.exportJson(newCoordJson, this.exportFilename);
                this.dialog = false;
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

    .errorText {
        color: red
    }

</style>