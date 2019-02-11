import Vue from "vue";
import Vuex from "vuex";
// import { gql } from 'apollo-boost';
import { defaultClient as apolloClient } from "./main"
Vue.use(Vuex);
import {
  ADD_POST,
  GET_POSTS,
  SIGNIN_USER,
  GET_CURRENT_USER,
  SIGNUP_USER,
  SEARCH_POSTS,
  GET_USER_POSTS,
  UPDATE_USER_POST,
  DELETE_USER_POST,
  INFINITE_SCROLL_POSTS
} from './queries';
import router from './router';

export default new Vuex.Store({
  state: {
    posts: [],
    user: null,
    loading: false,
    error: null,
    authError: null,
    searchResults: [],
    userPosts: []
  },
  mutations: {
    SET_SEARCH_RESULTS(state, payload) {
      if (payload !== null) {
        state.searchResults = payload;
      }
    },
    SET_POSTS(state, payload) {
      state.posts = payload;
    },
    SET_LOADING(state, payload) {
      state.loading = payload;
    },
    SET_USER(state, payload) {
      state.user = payload;
    },
    SET_USER_POSTS(state, payload) {
      state.userPosts = payload;
    },
    CLEAR_USER: state => (state.user = null),
    CLEAR_ERROR: state => (state.error = null),
    CLEAR_SEARCH_RESULTS: state => state.searchResults = [],
    SET_ERROR: (state, payload) => {
      state.error = payload;
    },
    SET_AUTH_ERROR: (state, payload) => {
      state.authError = payload;
    }
  },
  actions: {
    searchPosts: ({ commit }, payload) => {
      apolloClient.query({
        query: SEARCH_POSTS,
        variables: payload
      }).then(({ data }) => {
        // console.log("data search posts", data.searchPosts);
        commit('SET_SEARCH_RESULTS', data.searchPosts);
      }).catch(err => {
        console.error(err);
      })
    },
    getPosts: ({ commit }) => {
      // user ApolloClient to fire getPosts Query
      commit("SET_LOADING", true);
      apolloClient.query({
        query: GET_POSTS
      }).then(({ data }) => {
        commit("SET_POSTS", data.getPosts);
        commit("SET_LOADING", false);
        // console.log(data.getPosts)
      }).catch(err => {
        console.error(err);
        commit("SET_LOADING", false);
      })
    },
    addPost: ({ commit }, payload) => {
      commit('SET_LOADING', true);
      console.log(payload)
      apolloClient.mutate({
        mutation: ADD_POST,
        variables: payload,
        update: (cache, { data: { addPost } }) => {
          // first read the query you want to update
          const data = cache.readQuery({ query: GET_POSTS });
          //create updated data -- add new post to others
          data.getPosts.unshift(addPost);
          // write back to update query
          cache.writeQuery({
            query: GET_POSTS,
            data
          })
        },
        // optimistic response ensures data added to cache
        //is added immediately
        optimisticResponse: {
          __typename: "Mutation",
          addPost: {
            __typename: "Post",
            _id: -1,
            ...payload
          }
        },
        // rerun specific queries after performing mutation in order to return fresh data
        refetchQueries: [
          {
            query: INFINITE_SCROLL_POSTS,
            variables: {
              pageNum: 1,
              pageSize: 2
            }
          }
        ]
      }).then(({ data }) => {
        commit('SET_LOADING', false);
        //console.log('dataPOst', data.addPost);
      }).catch(err => {
        commit('SET_LOADING', false);
        console.error(err);
      })
    },
    deleteUserPost: ({ state, commit }, payload) => {
      apolloClient.mutate({
        mutation: DELETE_USER_POST,
        variables: payload
      }).then(({ data }) => {
        const index = state.userPosts.findIndex(post => post._id == data.deleteUserPost._id);
        const userPosts = [
          ...state.userPosts.slice(0, index),
          ...state.userPosts.slice(index + 1)];
        commit("SET_USER_POSTS", userPosts)
      }).catch(err => {
        console.error(err);
      })
    },
    updateUserPost: ({ state, commit }, payload) => {
      apolloClient.mutate({
        mutation: UPDATE_USER_POST,
        variables: payload,
      }).then(({ data }) => {
        const index = state.userPosts.findIndex(post => post._id == data.updateUserPost._id);
        const userPosts = [
          ...state.userPosts.slice(0, index),
          data.updateUserPost,
          ...state.userPosts.slice(index + 1)];
        commit("SET_USER_POSTS", userPosts)
      }).catch(err => {
        console.error(err);
      })
    },
    getUserPosts: ({ commit }, payload) => {
      apolloClient.query({
        query: GET_USER_POSTS,
        variables: payload
      }).then(({ data }) => {
        commit('SET_USER_POSTS', data.getUserPosts)
        // console.log(data.getUserPosts);
      }).catch(err => {
        console.error(err);
      })
    },
    getCurrentUser: ({ commit }) => {
      commit('SET_LOADING', true);
      apolloClient.query({
        query: GET_CURRENT_USER
      }).then(({ data }) => {
        commit('SET_LOADING', false);
        commit('SET_USER', data.getCurrentUser);
        // console.log('currentUser', data.getCurrentUser)
      }).catch(err => {
        commit('SET_LOADING', false);
        console.error(err)
      })
    },
    signinUser: ({ commit }, payload) => {
      commit('CLEAR_ERROR');
      commit("SET_LOADING", true);

      apolloClient.mutate({
        mutation: SIGNIN_USER,
        variables: payload
      }).then(({ data }) => {
        commit("SET_LOADING", false);
        //set token for k/v pair
        localStorage.setItem('token', data.signinUser.token);
        // once signin occurs, hook into created()
        router.go();
      }).catch(err => {
        commit('SET_ERROR', err);
        commit("SET_LOADING", false);
        console.error(err);
      })
    },
    signoutUser: async ({ commit }) => {
      //clear user in state
      commit('CLEAR_USER');
      // remove token from localStorage
      localStorage.setItem('token', '');
      // end session of apollo client
      await apolloClient.resetStore();
      // redirect home from private page
      router.push('/');

    },
    signupUser: ({ commit }, payload) => {
      commit('CLEAR_ERROR');
      commit("SET_LOADING", true);

      apolloClient.mutate({
        mutation: SIGNUP_USER,
        variables: payload
      }).then(({ data }) => {
        commit("SET_LOADING", false);
        //set token for k/v pair
        localStorage.setItem('token', data.signupUser.token);
        // once signin occurs, hook into created()
        router.go();
      }).catch(err => {
        commit('SET_ERROR', err);
        commit("SET_LOADING", false);
        console.error(err);
      })
    },
  },
  getters: {
    posts: state => state.posts,
    loading: state => state.loading,
    user: state => state.user,
    error: state => state.error,
    authError: state => state.authError,
    userFavorites: state => state.user && state.user.favorites,
    searchResults: state => state.searchResults,
    userPosts: state => state.userPosts
  }
});
