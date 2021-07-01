<template>
    <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
            <v-btn 
                class="inner"
                icon
                v-bind="attrs"
                v-on="on" 
                @click="handleClickLineDelete()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-dialog
                v-model="dialogLine"
                width="50vh"
                height="100vh"
                @keydown.enter="handleOnLineDelete"
                @keydown.esc="dialog = false"
            >
                <v-card>
                    <v-card-title class="headline grey lighten-2">
                        Are you sure you want to delete this line?
                    </v-card-title>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="primary"
                            text
                            @click="handleOnLineDelete"
                        >
                            Yes
                        </v-btn>
                        <v-btn
                            color="primary"
                            text
                            @click="dialogLine = false"
                        >
                            Cancel
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </template>
        <span>Delete</span>
    </v-tooltip>
</template>

<script>

export default {
    created() {
        this.$root.$refs.LineDeleteConfirm = this;
    },
    data: () => ({
        dialogLine: false
    }),
    computed: {
        activeMarker() {
            return this.$store.state.activeMarker;
        }
    },
    components: {

    },
    props: {
        
    },
    methods: {
        handleClickLineDelete() {
            this.dialogLine = true; 
        },
        handleOnLineDelete() {
            this.dialogLine = false;
            this.$root.$refs.Map.deleteLineSegment(this.activeMarker);
        },
    }
}
</script>

<style scoped>

</style>
