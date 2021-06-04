import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        additionMode: "",                                   //controls the mode of adding a new marker or line segment
        activeMarker: {},                                   //current active marker OR line segment
        activeMode: "",                                     //current active mode can be line segment or marker
        markers: [],                                        //marker list for the map
        lineSegments: [],                                   //line segment list the map
        importedCoordJson: {},                              //imported Json
        mapImageURL: require("./doushishaRyokanBldg.jpg"),  //image for the map. defaulted to doushisha map
        mapBounds: [700, 1200],                             //map size (in pixels). defaulted to dousisha map size
        mapImageName: "",                                   //name of the fileName
        keyListen: true,                                    //boolean whether to listen for key bindings or not (usually should turn off for dialogs)
        loading: false,                                     //for controlling loading screen  
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
        // ----------- misc ----------------
        changeKeyListen(state, newState) {
            state.keyListen = newState;
        },
        changeLoading(state, isLoading) {
            state.loading = isLoading;
        }
    },
    actions: {
        // ----  for changing map bounds, map image url, and map image name ----
        changeMapBounds (context, newBounds) {
            context.commit('changeMapBounds', newBounds);
        },
        changeMapImageUrl(context, newUrl) {
            context.commit('changeMapImageUrl', newUrl);
        },
        changeMapImageName(context, newName) {
            context.commit('changeMapImageName', newName);
        },
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
        //adds a new line segment to the list
        addToLineSegments(context, lineToAdd) {
            console.log(lineToAdd);
            context.commit('addToLineSegments', lineToAdd);
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
        //deletes line segment
        deleteFromLineSegments(context, lineToDelete) {
            let toDeleteLineIndex = context.state.lineSegments.indexOf(lineToDelete);
            context.commit('deleteFromLineSegmentsByIndex', toDeleteLineIndex);
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
        //sets a completely new line segments list
        setNewLineSegmentsList(context, newLineSegments) {
            context.commit('setNewLineSegments', newLineSegments);
        },
        changeKeyListen(context, newState) {
            context.commit('changeKeyListen', newState);
        },
        changeLoading(context, newState) {
            console.log(newState);
            context.commit('changeLoading', newState);
        }
    }
  })