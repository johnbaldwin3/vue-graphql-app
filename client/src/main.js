
import Vue from "vue";
import './plugins/vuetify'
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';
import FormAlert from './components/Shared/FormAlert';

//register as a global component
Vue.component('form-alert', FormAlert);

Vue.use(VueApollo);

export const defaultClient = new ApolloClient({
  uri: "http://localhost:4600/graphql",
  // include auth token with requests to backend
  fetchOptions: {
    credentials: 'include'
  },
  request: operation => {
    // check for token in local storage
    if (!localStorage.token) {
      localStorage.setItem('token', '');
    }
    // operation adds token to authorization header
    // which is sent to teh backend
    operation.setContext({
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
  },
  onError: ({ graphQLErrors, networkError }) => {
    if (networkError) {
      console.log("[networkError", networkError)
    }

    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.dir(err);
        if (err.name === "AuthenticationError") {
          store.commit('SET_AUTH_ERROR', err);
          store.dispatch('signoutUser');
        }
      }
    }
  }
});

const apolloProvider = new VueApollo({ defaultClient });

Vue.config.productionTip = false;

new Vue({
  provide: apolloProvider.provide(),
  router,
  store,
  render: h => h(App),
  created() {
    //execute get currentUser query to authenticate
    this.$store.dispatch('getCurrentUser');
  }
}).$mount("#app");
