<template>
    <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
            <v-btn 
                class="inner"
                icon
                v-bind="attrs"
                v-on="on" 
                @click="handleClickDelete()">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-dialog
                v-model="dialog"
                width="50vh"
                height="100vh"
                @keydown.enter="handleOnDelete"
                @keydown.esc="dialog = false"
            >
                <v-card>
                    <v-card-title class="headline grey lighten-2">
                        Are you sure you want to delete this point?
                    </v-card-title>

                    <v-divider></v-divider>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            color="primary"
                            text
                            @click="handleOnDelete"
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
        </template>
        <span>Delete</span>
    </v-tooltip>
</template>

<script>

export default {
    created() {
        this.$root.$refs.MarkerDeleteConfirm = this;
    },
    data: () => ({
        dialog: false
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
        handleClickDelete() {
            this.dialog = true;
        },
        handleOnDelete() {
            this.dialog = false;

            this.$root.$refs.Map.deleteMarker(this.activeMarker);
        },
    }
}
</script>

<style scoped>

</style>
