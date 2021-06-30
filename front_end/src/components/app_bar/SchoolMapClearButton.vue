<template>
    <div>
        <v-btn
            depressed
            color="error"
            @click="handleClearConfirm()"
        >
            Clear
        </v-btn>
        <v-dialog
            v-model="dialogClear"
            width="50vh"
            height="100vh"
            @keydown.enter="handleClear()"
            @keydown.esc="handleClearOff()"
            @click:outside="handleClearOff()"
        >
            <v-card>
                <v-card-title class="headline grey lighten-2">
                    Are you sure you want to clear map?
                </v-card-title>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="handleClear()"
                    >
                        Yes
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        @click="handleClearOff()"
                    >
                        No
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>

export default {
    data: () => ({
        
    }),
    computed: {
        dialogClear() {
            return this.$store.state.dialogClear;
        },
    },
    components: {
        
    },
    props: {
        
    },
    methods: {
        async handleClear() {
            this.$store.dispatch('changeLoading', true);
            this.$store.dispatch('clearAllMarkersAndSegments');
            this.axios.post("http://localhost:5000/clear").then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error);
            });

            this.$store.dispatch('changeLoading', false);
            this.$store.dispatch('changeDialogClear', false);
        },
        handleClearOff() {
            this.$store.dispatch('changeDialogClear', false);
        },
        handleClearConfirm() {
            this.$store.dispatch('changeDialogClear', true);
        }
    }
}
</script>

<style scoped>

    .errorText {
        color: red
    }

</style>