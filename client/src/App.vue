<template>
  <v-app style="background: #E3E3EE">
    <!-- Side Bar Navigation -->
    <v-navigation-drawer app temporary fixed v-model="sideNav">
      <v-toolbar color="accent" flat dark>
        <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
        <router-link to="/" tag="span" style="cursor: pointer">
          <h1 class="title pl-3">VueShare</h1>
        </router-link>
      </v-toolbar>

      <v-divider></v-divider>

      <v-list>
        <v-list-tile ripple v-for="item in sideNavItems" :key="item.title" :to="item.link">
          <v-list-tile-action>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>{{item.title}}</v-list-tile-content>
        </v-list-tile>

        <!-- Signout Button  -->
        <v-list-tile v-if="user" @click="handleSignoutUser">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Sign Out</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <!-- Horizontal Nav Bar -->
    <v-toolbar fixed color="primary" dark>
      <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
      <v-toolbar-title class="hidden-xs-only">
        <router-link to="/" tag="span" style="cursor: pointer">VueShare</router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Search Input -->
      <v-text-field
        v-model="searchTerm"
        @input="handleSearchPosts"
        flex
        prepend-icon="search"
        placeholder="Search Posts"
        color="accent"
        single-line
        hide-details
      ></v-text-field>

      <!-- Search Results Card -->
      <v-card dark v-if="searchResults.length" id="search__card">
        <v-list>
          <v-list-tile
            @click="goToSearchResult(result._id)"
            v-for="result in searchResults"
            :key="result._id"
          >
            <v-list-tile-title>
              {{result.title}} -
              <span
                class="font-weight-thin"
              >{{formatResultDescription(result.description)}}</span>
            </v-list-tile-title>
            <v-list-tile-action v-if="checkIfUserFavorite(result._id)">
              <v-icon>favorite</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
      <v-spacer></v-spacer>

      <!-- Horizontal Nav Bar  -->
      <v-toolbar-items class="hidden-xs-only" color="primary" dark>
        <v-btn flat dark v-for="item in horizontalNavItems" :key="item.title" :to="item.link">
          <v-icon class="hidden-sm-only" left>{{item.icon}}</v-icon>
          {{item.title}}
        </v-btn>

        <!-- Profile Button -->
        <v-btn flat to="/profile" v-if="user">
          <v-icon class="hidden-sm-only" left>account_box</v-icon>
          <v-badge :class="{'bounce' : badgeAnimated }" right color="secondary">
            <span v-if="userFavorites.length" slot="badge">{{userFavorites.length}}</span>
            Profile
          </v-badge>
        </v-btn>
        <!-- Signout Button  -->
        <v-btn flat v-if="user" @click="handleSignoutUser">
          <v-icon class="hidden-sm-only" left>exit_to_app</v-icon>Sign Out
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <!-- App Content -->
    <main>
      <v-container class="mt-4">
        <transition name="fade">
          <router-view/>
        </transition>
        <!-- Auth Snackbar -->
        <v-snackbar v-model="authSnackbar" bottom left :timeout="5000" color="success">
          <v-icon class="mr-3">check_circle</v-icon>
          <h5>You are now signed in!</h5>
          <v-btn dark flat @click="authSnackbar = false">Close</v-btn>
        </v-snackbar>
        <!-- Auth Error Snackbar -->
        <v-snackbar
          v-if="authError"
          v-model="authErrorSnackbar"
          bottom
          left
          :timeout="10000"
          color="warning"
        >
          <v-icon class="mr-3">cancel</v-icon>
          <h5>{{authError.message}}</h5>
          <v-btn dark flat to="/signin">Sign in</v-btn>
        </v-snackbar>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "App",
  components: {},
  data() {
    return {
      sideNav: false,
      authSnackbar: false,
      authErrorSnackbar: false,
      badgeAnimated: false,
      searchTerm: ""
    };
  },
  watch: {
    user(newValue, oldValue) {
      //if we had no value previously for user
      // show snackbar
      if (oldValue == null) {
        this.authSnackbar = true;
      }
    },
    authError(value) {
      if (value !== null) {
        this.authErrorSnackbar = true;
      }
    },
    userFavorites(value) {
      if (value) {
        this.badgeAnimated = true;
        setTimeout(() => {
          this.badgeAnimated = false;
        }, 1000);
      }
    }
  },
  computed: {
    ...mapGetters(["user", "authError", "userFavorites", "searchResults"]),
    horizontalNavItems() {
      let items = [
        { icon: "chat", title: "Posts", link: "/posts" },
        { icon: "lock_open", title: "Sign In", link: "/signin" },
        { icon: "create", title: "Sign Up", link: "/signup" }
      ];

      if (this.user) {
        items = [{ icon: "chat", title: "Posts", link: "/posts" }];
      }

      return items;
    },
    sideNavItems() {
      let items = [
        { icon: "chat", title: "Posts", link: "/posts" },
        { icon: "lock_open", title: "Sign In", link: "/signin" },
        { icon: "create", title: "Sign Up", link: "/signup" }
      ];

      if (this.user) {
        items = [
          { icon: "chat", title: "Posts", link: "/posts" },
          { icon: "stars", title: "Create Post", link: "/post/add" },
          { icon: "account_box", title: "Profile", link: "/profile" }
        ];
      }
      return items;
    }
  },
  methods: {
    checkIfUserFavorite(resultId) {
      return (
        this.userFavorites &&
        this.userFavorites.some(fave => fave._id === resultId)
      );
    },
    formatResultDescription(descrip) {
      return descrip.length > 30 ? `${descrip.slice(0, 30)}...` : descrip;
    },
    goToSearchResult(resultId) {
      // clear search term
      this.searchTerm = "";
      // go to desired route (post)
      this.$router.push(`/posts/${resultId}`);
      this.$store.commit("CLEAR_SEARCH_RESULTS");
    },
    handleSearchPosts() {
      this.$store.dispatch("searchPosts", {
        searchTerm: this.searchTerm
      });
    },
    handleSignoutUser() {
      this.$store.dispatch("signoutUser");
    },
    toggleSideNav() {
      this.sideNav = !this.sideNav;
    }
  }
};
</script>
<style>
h1 {
  font-weight: 400;
  font-size: 2.5rem;
}
h2 {
  font-weight: 400;
  font-size: 2rem;
}

#search__card {
  position: absolute;
  width: 100vw;
  z-index: 8;
  top: 100%;
  left: 0%;
}

.fade-enter-active,
.fade-leave-active {
  transition-property: all;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
  /*transform: translateY(-25px);*/
}

.bounce {
  animation: bounce 1s both;
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  40%,
  43% {
    transform: translate3d(0, -20px, 0);
  }

  70% {
    transform: translate3d(0, -10px, 0);
  }

  90% {
    transform: translate3d(0, -4px, 0);
  }
}
</style>
