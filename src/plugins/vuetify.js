import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    devServer: {
        proxy: 'http://api.back.end',
        headers: {
          "Access-Control-Allow-Origin": "*",
       }
    }
});
