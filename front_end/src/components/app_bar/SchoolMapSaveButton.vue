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
        databaseLocalHost() {
            return this.$store.state.databaseLocalHost;
        },
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
            let payload = {
                markers: this.markers
                ,line_segments: this.line_segments
                ,map_settings: {
                    map_image: this.mapImageURL
                    ,map_height: this.mapBounds[0]
                    ,map_width: this.mapBounds[1]
                }
            }
            this.axios.post("http://" + this.databaseLocalHost + "/save", payload).then(response => {
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