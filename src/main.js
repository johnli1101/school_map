import Vue from 'vue';
import App from './App.vue';
import store from './components/store';
import vuetify from './plugins/vuetify';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';

Vue.config.productionTip = false
Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
