import axios from 'axios';

export default {
    data: () => ({
        currentPicture: "",
        currentPictureAgl:""
    }),
    created: function () {
      //  console.log(‘Printing from the Mixin’)
    },
    methods: {
      async takePicture() {
         this.$store.dispatch('changeLoading', true);
         let response = await axios.post("http://localhost:5000/takePicture");
         console.log(response);
         let pictureId = response["data"]["id"];
         let pictureStatus = await this.waitForFunction(pictureId);
         console.log(pictureStatus);
         this.currentPicture = pictureStatus["results"]["fileUrl"];
         this.currentPictureAgl = '123'
         console.log(this.currentPicture, this.currentPictureAgl);
         this.$store.dispatch('changeLoading', false);
      },
      async waitForFunction(pictureId) {
         //while loop to wait for the status of the picture to finish
         let whileLoopStatus = false;
         let statusResponse = {};
         while(!whileLoopStatus) {
            await new Promise(r => setTimeout(r, 2000));
            statusResponse = await axios.post("http://localhost:5000/pictureStatus", {id: pictureId});
            console.log(statusResponse);
            if(statusResponse["data"]["state"] === "done") {
               // var headers = statusResponse.headers();
               // var blob = new Blob([statusResponse.data],{type:headers['content-type']});
               // var link = document.createElement('a');
               // link.href = window.URL.createObjectURL(blob);
               // link.download = "Filename";
               // link.click();
               whileLoopStatus = true;
            }
         }
         console.log("Done Waiting");
         return statusResponse["data"];
      },
    }
 };