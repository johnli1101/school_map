<template>
    <div>
        <v-btn
            depressed
            color="success"
            @click="handleSave()"
        >
            Save
        </v-btn>
    </div>
</template>

<script>

export default {
    data: () => ({
        
    }),
    computed: {
        markers() {
            return this.$store.state.markers;
        },
        lineSegments() {
            return this.$store.state.lineSegments;
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
        async handleSave() {
            this.$store.dispatch('changeLoading', true);
            this.axios.post("http://localhost:5000/save", this.markers).then(response => {
                console.log(response);
            }).catch(error => {
                console.log(error);
            });

            this.$store.dispatch('changeLoading', false);
        },
    }
}
</script>

<style scoped>

    .errorText {
        color: red
    }

</style>