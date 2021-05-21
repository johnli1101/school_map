import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        additionMode: "",
        activeMarker: {},
        activeMode: "",
        markers: [],
        lineSegments: []
    },
    mutations: {
        changeMode (state, mode) {
            state.additionMode = mode;
        },
        changeActiveMarker (state, marker) {
            state.activeMarker = marker;
        },
        changeActiveMode (state, mode) {
            state.activeMode = mode;
        },
        updateMarkers (state, payload) {
            let markerIndex = state.markers.indexOf(payload.marker);
            Vue.set(state.markers[markerIndex], "lat", payload.newLat);
            Vue.set(state.markers[markerIndex], "lng", payload.newLng);
        },
        addToMarkers (state, newMarker) {
            state.markers.push(newMarker);
        },
        deleteFromMarkersByIndex (state, markerIndexToDelete) {
            state.markers.splice(markerIndexToDelete, 1);
        },
        addToLineSegments (state, lineSegment) {
            state.lineSegments.push(lineSegment);
        },
        updateLineByIndexCoord (state, payload) {
            let toChangeIndex = state.lineSegments.indexOf(payload.lineSegment);
            Vue.set(state.lineSegments[toChangeIndex].coord, payload.coordIndex, payload.newCoord);
        },
        deleteFromLineSegmentsByIndex (state, lineIndexToDelete) {
            state.lineSegments.splice(lineIndexToDelete, 1);
        },
        eraseAllMarkers (state) {
            state.markers = [];
        },
        eraseAllLineSegments (state) {
            state.lineSegments = [];
        },
        setNewMarkers (state, newMarkers) {
            console.log(state.markers);
            console.log(newMarkers);
            state.markers = newMarkers;
            console.log(state.markers);
        },
        setNewLineSegments (state, newLineSegments) {
            state.lineSegments = newLineSegments;
        }
    },
    actions: {
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
        changeActiveMarker(context, marker) {
            context.commit('changeActiveMarker', marker);
        },
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
        deleteFromLineSegments(context, lineToDelete) {
            let toDeleteLineIndex = context.state.lineSegments.indexOf(lineToDelete);
            context.commit('deleteFromLineSegmentsByIndex', toDeleteLineIndex);
        },
        clearAllMarkersAndSegments(context) {
            context.commit('eraseAllLineSegments');
            context.commit('eraseAllMarkers');
        },
        setNewMarkersList(context, newMarkers) {
            context.commit('setNewMarkers', newMarkers);
        },
        setNewLineSegmentsList(context, newLineSegments) {
            context.commit('setNewLineSegments', newLineSegments);
        }

    }
  })