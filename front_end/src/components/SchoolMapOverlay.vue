<template>
    <v-overlay :value="loading">
        <v-progress-circular
            :size="70"
            :width="7"
            color="purple"
            indeterminate
        >
        </v-progress-circular>
    </v-overlay>
</template>

<script>

  export default {
    computed: {
        loading() {
            return this.$store.state.loading;
        },
    },
    data: () => ({

    }),
    props: {

    },
    methods: {

    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v-overlay {
  z-index: 9999 !important;
}
</style>
