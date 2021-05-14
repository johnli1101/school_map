<template>
  <v-app>
      <SchoolMapContainer/>
  </v-app>
</template>

<script>
import SchoolMapContainer from './components/SchoolMapContainer';

export default {
  name: 'SchoolMap',

  components: {
    SchoolMapContainer,
  },

  data: () => ({
    //
  })
};
</script>
