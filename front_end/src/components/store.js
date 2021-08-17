import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        //localHostName: "192.168.0.238:8080",                //localhost
        localHostName: "localhost:8080",
        databaseLocalHost: "localhost:5000",
        //databaseLocalHost: "192.168.0.238:5000",            //database
        additionMode: "",                                   //controls the mode of adding a new marker or line segment
        activeMarker: {},                                   //current active marker OR line segment
        activeImageMarker: {},                              //current active image marker
        activeMode: "",                                     //current active mode can be line segment or marker
        markers: [],                                        //marker list for the map; for testing: {label: 1, lat: 319.09246170653944, lng: 411.06777986636115, picture: "./R0010298.JPG", pictureMarkers: []}
        lineSegments: [],                                   //line segment list the map
        importedCoordJson: {},                              //imported Json
        mapImageURL: require("./doushishaRyokanBldg.jpg"),  //image for the map. defaulted to doushisha map
        mapBounds: [700, 1200],                             //map size (in pixels). defaulted to dousisha map size
        mapImageName: "",                                   //name of the fileName
        keyListen: true,                                    //boolean whether to listen for key bindings or not (usually should turn off for dialogs)
        loading: false,                                     //for controlling loading screen  
        dialogLine: false,                                  //dialog control in toolbar for line segment deletion       
        dialogDelete: false,                                //dialog control in toolbar for marker deletion
        dialogCamera: false,                                //dialog control in toolbar for after picture taking
        dialogCameraConfirm: false,                         //dialog control in toolbar for camera picture taking confirmation
        dialogCameraPreview: false,                         //dialog control in toolbar for camera picture preview
        dialogUploadImage: false,                           //dialog control in image marker for camera image upload
        dialogUploadImageUrl: false,                        //dialog control in image marker for uploading image by url
        dialogImageMarkerPreview: false,                    //dialog control in image marker for image preview
        dialogClear: false,                                 //dialog control in appbar for clear map
        updateImageMarkerMode: false,                         //to check if uploading a new image for image marker to replace
    },
    mutations: {
        // ----- all mode mutations ----
        changeMode(state, mode) {
            state.additionMode = mode;
        },
        changeActiveMarker(state, marker) {
            state.activeMarker = marker;
        },
        changeActiveMode(state, mode) {
            state.activeMode = mode;
        },
        // ----- all marker mutations -------
        updateMarkers (state, payload) {
            let markerIndex = state.markers.indexOf(payload.marker);
            Vue.set(state.markers[markerIndex], "lat", payload.newLat);
            Vue.set(state.markers[markerIndex], "lng", payload.newLng);
        },
        setNewMarkers(state, newMarkers) {
            console.log(state.markers);
            console.log(newMarkers);
            state.markers = newMarkers;
            console.log(state.markers);
        },
        addToMarkers(state, newMarker) {
            state.markers.push(newMarker);
        },
        deleteFromMarkersByIndex(state, markerIndexToDelete) {
            state.markers.splice(markerIndexToDelete, 1);
        },
        eraseAllMarkers(state) {
            state.markers = [];
        },
        updateMarkerPicture(state, payload) {
            Vue.set(state.markers[payload.index], "picture", payload.picture);
            console.log(state.markers[payload.index]);
        },
        // -------- image marker mutations --------------
        changeActiveImageMarker(state, imageMarker) {
            state.activeImageMarker = imageMarker;
        },
        addNewImageMarker(state, payload) {
            let toChangeIndex = state.markers.indexOf(payload.markerToChange);
            state.markers[toChangeIndex]["pictureMarkers"].push(payload.newImageMarker);
            console.log(state.markers);
        },
        updateImageMarkerImage(state, payload) {
            let toChangeIndex = payload.markerIndex;
            let imageMarkerIndex = payload.imageMarkerIndex;
            Vue.set(state.markers[toChangeIndex]["pictureMarkers"][imageMarkerIndex], "picture", payload.newImage); 
        },
        updateImageMarkerCoord(state, payload) {
            let toChangeIndex = payload.markerIndex;
            let imageMarkerIndex = payload.imageMarkerIndex;
            Vue.set(state.markers[toChangeIndex]["pictureMarkers"][imageMarkerIndex], "lat", payload.newLat);
            Vue.set(state.markers[toChangeIndex]["pictureMarkers"][imageMarkerIndex], "lng", payload.newLng); 
        },
        deleteImageMarker(state, payload) {
            let toChangeIndex = payload.markerIndex;
            let markerIndexToDelete = payload.imageMarkerIndex;
            state.markers[toChangeIndex]["pictureMarkers"].splice(markerIndexToDelete, 1);
        },
        updateImageVariable(state, mode) {
            state.updateImageMarkerMode = mode
        },
        // -------- all line segment mutations ----------
        addToLineSegments(state, lineSegment) {
            state.lineSegments.push(lineSegment);
        },
        updateLineByIndexCoord(state, payload) {
            let toChangeIndex = state.lineSegments.indexOf(payload.lineSegment);
            Vue.set(state.lineSegments[toChangeIndex].coord, payload.coordIndex, payload.newCoord);
        },
        setNewLineSegments(state, newLineSegments) {
            state.lineSegments = newLineSegments;
        },
        deleteFromLineSegmentsByIndex(state, lineIndexToDelete) {
            state.lineSegments.splice(lineIndexToDelete, 1);
        },
        eraseAllLineSegments(state) {
            state.lineSegments = [];
        },
        // -------- all map mutations -------------
        changeMapBounds(state, newBounds) {
            state.mapBounds = newBounds;
        },
        changeMapImageUrl(state, newUrl) {
            state.mapImageURL = newUrl;
        },
        changeMapImageName(state, newName) {
            state.mapImageName = newName;
        },
        // ----------- dialog mutations -------------
        changeDialogDelete(state, newState) {
            state.dialogDelete = newState;
        },
        changeDialogLine(state, newState) {
            state.dialogLine = newState;
        },
        changeDialogCamera(state, newState) {
            state.dialogCamera = newState;
        },
        changeDialogCameraPreview(state, newState) {
            state.dialogCameraPreview = newState;
        },
        changeDialogCameraConfirm(state, newState) {
            state.dialogCameraConfirm = newState;
        },
        changeDialogUploadImage(state, newState) {
            state.dialogUploadImage = newState;
        },
        changeDialogUploadImageUrl(state, newState) {
            state.dialogUploadImageUrl = newState;
        },
        changeDialogImageMarkerPreview(state, newState) {
            state.dialogImageMarkerPreview = newState;
        },
        changeDialogClear(state, newState) {
            state.dialogClear = newState;
        },
        // ----------- misc ----------------
        changeKeyListen(state, newState) {
            state.keyListen = newState;
        },
        changeLoading(state, isLoading) {
            state.loading = isLoading;
        },
    },
    actions: {
        // ----  for changing map bounds, map image url, and map image name ----
        changeMapBounds (context, newBounds) {
            console.log(newBounds);
            if((newBounds[0] === 0 && newBounds[1] === 0) || newBounds[0] === null || newBounds[1] === null || newBounds.length !== 2) {
                context.commit('changeMapBounds', [700, 1200]);
            }
            else {
                console.log("HELLO");
                context.commit('changeMapBounds', newBounds);
            }
        },
        changeMapImageUrl(context, newUrl) {
            console.log(newUrl);
            if(newUrl === "" || newUrl === null) {
                context.commit('changeMapImageUrl', require('./doushishaRyokanBldg.jpg'));
            }
            else {
                let filename = newUrl.substr(newUrl.lastIndexOf('/') + 1);
                console.log(filename);
                let newFilePath = context.state.localHostName + "/uploaded_assets/map/" + filename
                context.commit('changeMapImageUrl', newFilePath);
            }
        },
        changeMapImageName(context, newName) {
            context.commit('changeMapImageName', newName);
        },
        // -----------`----- Changing Modes and Active Markers ------------------
        //changes the mode of the adding line or marker
        changeMode(context, mode) {
            console.log(mode +  " " + context.state.additionMode);
            if(context.state.additionMode === mode) {
                context.commit('changeMode', "");
            }
            else {
                switch (mode) {
                    case "addMarker":
                        context.commit('changeMode', mode);
                        break;
                    case "addConnectedMarker":
                        context.commit('changeMode', mode);
                        break;
                    case "lineAdd":
                        context.commit('changeMode', mode);
                        break;
                    default:
                        context.commit('changeMode', "");
                        break;
                }
            }
        },
        //changes the active marker or to line segment
        changeActiveMarker(context, marker) {
            context.commit('changeActiveMarker', marker);
        },
        //changes the mode of either line segment or marker mode
        changeActiveMode(context, mode) {
            context.commit('changeActiveMode', mode);
        },
        // ----------------------- Markers --------------------------------
        //name: updateMarkers
        //description: updates a marker given by payload
        //payload requirement: 
        //   newLat: 200 (new lat value)
        //   newLng: 500 (new lng value)
        //   marker: {label: "1", lat: 200, lng: 400} marker object
        updateMarkers(context, payload) {
            context.commit('updateMarkers', payload);
        },
        //adds a new marker to the list
        addToMarkers(context, newMarker) {
            context.commit('addToMarkers', newMarker);
        },
        //deletes from the markers state and updates the new active marker based off the deletion
        deleteFromMarkers(context, markerToDelete) {
            let toDeleteMarkerIndex = context.state.markers.indexOf(markerToDelete);
            context.commit('deleteFromMarkersByIndex', toDeleteMarkerIndex);     

            if(context.state.markers.length === 1 || (toDeleteMarkerIndex === 0 && context.state.markers.length > 0)) {
                context.commit('changeActiveMarker', context.state.markers[0]);
            }
            else if(context.state.markers.length > 0) {
                context.commit('changeActiveMarker', context.state.markers[toDeleteMarkerIndex-1]);
            }
            else {
                context.commit('changeActiveMarker', {});
            }
        },
        //payload requirement:
        //  picture: "picture.jpg" (picture from THETA camera)
        //  marker: { ... } (marker object to update)
        updateMarkerPicture(context, payload) {
            let markerIndex = context.state.markers.indexOf(payload.marker);
            let newPayload = {
                    index: markerIndex
                    ,picture: payload.picture
                };
            context.commit('updateMarkerPicture', newPayload);
        },
        //name: updateLineByIndexCoord
        //description: updates line by 1 set of coords at a time
        //payload requirement: 
        //   coordIndex: (0 || 1) (index of coordinate in lineSegments)
        //   newCoord: [40, 80] (new coordinate)
        //   lineSegment: {pt1: "1", pt2: "2", coord: [[10, 50], [20, 30]]} line segment object
        updateLineByIndexCoord(context, payload) {
            context.commit('updateLineByIndexCoord', payload);
        },

        //clears both markers and line segments lists
        clearAllMarkersAndSegments(context) {
            context.commit('eraseAllLineSegments');
            context.commit('eraseAllMarkers');
        },
        //sets a completely new marker list
        setNewMarkersList(context, newMarkers) {
            context.commit('setNewMarkers', newMarkers);
        },
        // --------------- Image markers -------------------
        // for changing the active image marker
        changeActiveImageMarker(context, imageMarker) {
            context.commit('changeActiveImageMarker', imageMarker);
        },
        // addNewMonMarker payload information:
        //      markerToChange: marker object
        //      newImageMarker: marker object
        addNewImageMarker(context, payload) {
            context.commit('addNewImageMarker', payload);
        },
        // updateImageMarker payload information:
        //      markerToChange: marker object
        //      imageMarker: marker object
        //      newImage: image url
        updateImageMarkerImage(context, payload) {
            let markerIndex = context.state.markers.indexOf(payload.markerToChange);
            let imageMarkerIndex = context.state.markers[markerIndex]["pictureMarkers"].indexOf(payload.imageMarker);
            let payload2 = {
                markerIndex: markerIndex
                ,imageMarkerIndex: imageMarkerIndex
                ,newImage: payload.newImage
            }
            context.commit('updateImageMarkerImage', payload2);
        },
        // updateImageMarkerCoord payload information:
        //      markerToChange: marker object
        //      imageMarker: marker object
        //      newLat: new lat value
        //      newLng: new lng value
        updateImageMarkerCoord(context, payload) {
            let markerIndex = context.state.markers.indexOf(payload.markerToChange);
            let imageMarkerIndex = context.state.markers[markerIndex]["pictureMarkers"].indexOf(payload.imageMarker);
            let payload2 = {
                markerIndex: markerIndex
                ,imageMarkerIndex: imageMarkerIndex
                ,newLat: payload.newLat
                ,newLng: payload.newLng
            }
            context.commit('updateImageMarkerCoord', payload2);
        },
        // deleteImageMarker payload information:
        //      markerToChange: marker object
        //      imageMarker: marker object
        deleteImageMarker(context, payload) {
            let markerIndex = context.state.markers.indexOf(payload.markerToChange);
            let imageMarkerIndex = context.state.markers[markerIndex]["pictureMarkers"].indexOf(payload.imageMarker);
            let payload2 = {
                markerIndex: markerIndex,
                imageMarkerIndex: imageMarkerIndex
            }
            context.commit('deleteImageMarker', payload2);
        },
        //changinge the mode of the variable for the dialog
        updateImageVariable(context, mode) {
            context.commit('updateImageVariable', mode);
        },
        //--------------- Line Segments ---------------------
        //deletes line segment
        deleteFromLineSegments(context, lineToDelete) {
            let toDeleteLineIndex = context.state.lineSegments.indexOf(lineToDelete);
            context.commit('deleteFromLineSegmentsByIndex', toDeleteLineIndex);
        },
        //sets a completely new line segments list
        setNewLineSegmentsList(context, newLineSegments) {
            context.commit('setNewLineSegments', newLineSegments);
        },
        //adds a new line segment to the list
        addToLineSegments(context, lineToAdd) {
            console.log(lineToAdd);
            context.commit('addToLineSegments', lineToAdd);
        },
        // --------------- Misc -------------------------
        changeKeyListen(context, newState) {
            context.commit('changeKeyListen', newState);
        },
        changeLoading(context, newState) {
            console.log(newState);
            context.commit('changeLoading', newState);
        },
        // -------------- Dialog Actions ------------------
        changeDialogDelete(context, newState) {
            context.commit('changeDialogDelete', newState);

            //also update the changeKeyListen to disable key presses while in dialog
            context.commit('changeKeyListen', !newState);
        },
        changeDialogLine(context, newState) {
            context.commit('changeDialogLine', newState);

            //also update the changeKeyListen to disable key presses while in dialog
            context.commit('changeKeyListen', !newState);
        },
        changeDialogCamera(context, newState) {
            context.commit('changeDialogCamera', newState);
            console.log(newState);
            context.commit('changeKeyListen', !newState);
        },
        changeDialogCameraPreview(context, newState) {
            context.commit('changeDialogCameraPreview', newState);

            context.commit('changeKeyListen', !newState);
        },
        changeDialogCameraConfirm(context, newState) {
            context.commit('changeDialogCameraConfirm', newState);

            context.commit('changeKeyListen', !newState);
        },
        changeDialogUploadImage(context, newState) {
            context.commit('changeDialogUploadImage', newState);

            context.commit('changeKeyListen', !newState);
        },
        changeDialogUploadImageUrl(context, newState) {
            context.commit('changeDialogUploadImageUrl', newState);

            context.commit('changeKeyListen', !newState);
        },
        changeDialogImageMarkerPreview(context, newState) {
            context.commit('changeDialogImageMarkerPreview', newState);

            context.commit('changeKeyListen', !newState);
        },
        changeDialogClear(context, newState) {
            context.commit('changeDialogClear', newState);

            context.commit('changeKeyListen', !newState);
        },
    }
  })