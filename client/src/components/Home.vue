<template>
  <v-container text-xs-center>
    <!-- Loading Spinner -->
    <v-layout row>
      <v-dialog v-model="loading" persistent fullscreen>
        <v-container fill-height>
          <v-layout row justify-center align-center>
            <v-progress-circular indeterminate :size="70" :width="7" color="secondary"></v-progress-circular>
          </v-layout>
        </v-container>
      </v-dialog>
    </v-layout>

    <!-- Explore Posts Button -->
    <v-layout class="mt-2 mb-3" v-if="!loading" row wrap>
      <v-flex xs12>
        <v-btn class="secondary" to="/posts" large dark>Explore Posts</v-btn>
      </v-flex>
    </v-layout>

    <!-- Posts Carousel -->
    <v-flex xs12>
      <v-carousel v-if="!loading && posts.length > 0" v-bind="{ 'cycle': true}" interval="7000">
        <v-carousel-item
          @click.native="goToPost(post._id)"
          v-for="post in posts"
          :key="post._id"
          :src="post.imageUrl"
        >
          <h1 id="carousel__title">{{post.title}}</h1>
        </v-carousel-item>
      </v-carousel>
    </v-flex>
    <!-- Examples of how to use apolloquery and smart query below -->
    <!-- <h1>Home</h1>
    <div v-if="$apollo.loading">Loading...</div>
    <ul v-else v-for="post in getPosts" :key="post._id">
      <li>
        {{post.title}}
        {{post.imageUrl}}
        {{post.description}}
      </li>
      <li>{{post.likes}}</li>
    </ul>-->
    <!-- <ApolloQuery :query="getPostsQuery">
      <template slot-scope="{result: { loading, data, error }}">
        <div v-if="loading">Loading...</div>
        <div v-else-if="error">Error! {{error.message}}</div>
        <ul v-else v-for="post in data.getPosts" :key="post._id">
          <li>
            {{post.title}}
            {{post.imageUrl}}
            {{post.description}}
          </li>
          <li>{{post.likes}}</li>
        </ul>
      </template>
    </ApolloQuery>-->
  </v-container>
</template>

<script>
// import { gql } from "apollo-boost";
import { mapState, mapGetters } from "vuex";
// import { mapActions } from "../store";

export default {
  name: "Home",
  created() {
    this.handleGetCarouselPosts();
  },
  components: {},
  data() {
    return {
      //
      // Used for ApolloQuery component
      // getPostsQuery: gql`
      //   query {
      //     getPosts {
      //       _id
      //       title
      //       imageUrl
      //       description
      //       likes
      //     }
      //   }
      // `
    };
  },
  computed: {
    ...mapGetters(["posts", "loading"])
  },
  methods: {
    handleGetCarouselPosts() {
      this.$store.dispatch("getPosts");
    },
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`);
    }
  }
  // apollo: {
  //   getPosts: {
  //     query: gql`
  //       query {
  //         getPosts {
  //           _id
  //           title
  //           imageUrl
  //           description
  //           likes
  //         }
  //       }
  //     `
  //   },
  //   result({ data, loading, networkStatus }) {
  //     if (!loading) {
  //       this.posts = data.getPosts;
  //       console.log("Network Stats", networkStatus);
  //     }
  //   },
  //   error(err) {
  //     console.error("[ERROR!!]", err);
  //   }
  // }
};
</script>
<style lang="stylus" scoped>
#carousel__title {
  cursor: pointer;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 5px 5px 0 0;
  padding: 0.5em;
  margin: 0 auto;
  bottom: 50px;
  left: 0;
  right: 0;
}
</style>
