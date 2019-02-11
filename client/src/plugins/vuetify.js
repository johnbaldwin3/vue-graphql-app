import Vue from 'vue'
import Vuetify from 'vuetify/lib/'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  iconfont: 'md',
  theme: {
    primary: '#673ab7',
    secondary: '#ff5722',
    accent: '#ff9800',
    error: '#e91e63',
    warning: '#f44336',
    info: '#2196f3',
    success: '#009688'
  }
})
