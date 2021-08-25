<template>
    <v-dialog
        v-model="dialogCameraConfirm"
        width="50vh"
        height="100vh"
        @keydown.enter="handleCameraConfirmTakePicture()"
        @keydown.esc="handleCameraConfirmOff()"
        @click:outside="handleCameraConfirmOff()"
    >
<!--      <template>-->
<!--        <v-card-->
<!--            class="mx-auto"-->
<!--            max-width="500"-->
<!--        >-->
<!--          <v-card-title class="text-h6 font-weight-regular justify-space-between">-->
<!--            <span>{{ currentDialogTitle }}</span>-->
<!--          </v-card-title>-->

<!--          <v-window v-model="windowNumber">-->
<!--            <v-window-item :value="1">-->
<!--              <v-card-actions>-->
<!--                <v-spacer></v-spacer>-->
<!--                  <v-btn-->
<!--                      color="primary"-->
<!--                      depressed-->
<!--                      @click="windowNumber++"-->
<!--                  >-->
<!--                    Yes-->
<!--                  </v-btn>-->
<!--                  <v-btn-->
<!--                      color="primary"-->
<!--                      text-->
<!--                      @click="handleCameraConfirmOff()"-->
<!--                  >-->
<!--                    Cancel-->
<!--                  </v-btn>-->
<!--              </v-card-actions>-->
<!--            </v-window-item>-->

<!--            <v-window-item :value="2">-->
<!--              <v-card-text>-->
<!--                <v-radio-group-->
<!--                    column-->
<!--                    v-model="radioNumber"-->
<!--                >-->
<!--                  <v-radio-->
<!--                      label="Use the same phone"-->
<!--                      value="1"-->
<!--                  ></v-radio>-->
<!--                  <v-radio-->
<!--                      hide-details-->
<!--                      class="shrink mr-2 mt-0"-->
<!--                      label="Use a different phone"-->
<!--                      value="2"-->
<!--                  ></v-radio>-->
<!--                  <v-text-field-->
<!--                      style="padding-top: 0"-->
<!--                      :disabled="radioNumber === '1'"-->
<!--                      label="Enter IP address"-->
<!--                      v-model="newIPAddress"-->
<!--                  ></v-text-field>-->
<!--                </v-radio-group>-->
<!--              </v-card-text>-->
<!--              <v-card-actions>-->
<!--                <v-btn-->
<!--                    :disabled="windowNumber === 1"-->
<!--                    text-->
<!--                    @click="windowNumber&#45;&#45;"-->
<!--                >-->
<!--                  Back-->
<!--                </v-btn>-->
<!--                <v-spacer></v-spacer>-->
<!--                <v-btn-->
<!--                    color="primary"-->
<!--                    depressed-->
<!--                    @click="handleCameraConfirmTakePicture()"-->
<!--                >-->
<!--                  OK-->
<!--                </v-btn>-->
<!--              </v-card-actions>-->
<!--            </v-window-item>-->
<!--          </v-window>-->
<!--          <v-divider></v-divider>-->
<!--        </v-card>-->
<!--      </template>-->
        <v-card>
            <v-card-title class="headline grey lighten-2">
                Do you want to take a picture?
            </v-card-title>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="handleCameraConfirmTakePicture()"
                >
                    Yes
                </v-btn>
                <v-btn
                    color="primary"
                    text
                    @click="handleCameraConfirmOff()"
                >
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>

// import {ipcRenderer} from "electron";

export default {
    created() {
        this.$root.$refs.CameraConfirmDialog = this;
    },
    data: () => ({
      // windowNumber: 1,
      // radioNumber: '1',
      // newIPAddress: ''

    }),
    computed: {
      // currentDialogTitle () {
      //   switch (this.windowNumber) {
      //     case 1: return 'Do you want to take a picture?'
      //     default: return 'Do you want to use the same phone?'
      //   }
      // },
        additionMode() {
            return this.$store.state.additionMode;
        },
        markers() {
            return this.$store.state.markers;
        },
        activeMarker() {
            return this.$store.state.activeMarker;
        },
        activeMode() {
            return this.$store.state.activeMode;
        },
        dialogCameraConfirm() {
            return this.$store.state.dialogCameraConfirm;
        },
        dialogCamera() {
            return this.$store.state.dialogCamera;
        }
    },
    components: {

    },
    props: {
        
    },
    methods: {
        handleCameraConfirm() {
            this.$store.dispatch('changeDialogCameraConfirm', true);
            console.log(this.activeMarker);
        },
        handleCameraConfirmOff() {
            this.$store.dispatch('changeDialogCameraConfirm', false);
        },
        handleCameraConfirmTakePicture() {
            this.$store.dispatch('changeDialogCameraConfirm', false);
            this.$store.dispatch('changeDialogCamera', false);
            this.$store.dispatch('changeDialogCameraPreview', false);
            // if(this.radioNumber === '2'){
            //   this.$store.commit('changeAndroidDeviceIPAddress', this.newIPAddress);
            // }
            this.$emit("take-picture");
        },
    }
}
</script>

<style scoped>

</style>