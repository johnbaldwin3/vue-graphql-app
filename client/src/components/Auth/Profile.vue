<template>
  <v-container class="text-xs-center">
    <!-- User Details Card -->
    <v-flex sm6 offset-sm3>
      <v-card class="white--text" color="secondary">
        <v-layout>
          <v-flex xs5>
            <v-img height="125px" contain :src="user.avatar"></v-img>
          </v-flex>
          <v-flex xs7>
            <v-card-title primary-title>
              <div>
                <div class="headline">{{user.username}}</div>
                <div>Joined: {{formatJoinDate(user.joinDate)}}</div>
                <div class="hidden-xs-only font-weight-thin">{{user.favorites.length}} Favorites</div>
                <div class="hidden-xs-only font-weight-thin">{{userPosts.length}} Posts Added</div>
              </div>
            </v-card-title>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>

    <!-- Posts Favorited By User -->
    <v-container v-if="!userFavorites.length">
      <v-layout row wrap>
        <v-flex xs12>
          <h2>You have no favorites currently, go add some!</h2>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container v-else class="mt-3">
      <v-flex xs12>
        <h2 class="font-weight-light">
          Favorites
          <span class="font-weight-regular">({{userFavorites.length}})</span>
        </h2>
      </v-flex>
      <v-layout row wrap>
        <v-flex xs12 sm6 v-for="fav in userFavorites" :key="fav._id">
          <v-card class="mt-3 ml-1 mr-2" hover>
            <v-img @click="goToPost(fav._id)" :src="fav.imageUrl" height="30vh"></v-img>
            <v-card-text>{{fav.title}}</v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <!-- User Posts -->
    <v-container v-if="!userPosts.length">
      <v-layout row wrap>
        <v-flex xs12>
          <h2>You have not created any posts yet, go contribute!</h2>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container v-else class="mt-3">
      <v-flex xs12>
        <h2 class="font-weight-light">
          Your Posts
          <span class="font-weight-regular">({{userPosts.length}})</span>
        </h2>
      </v-flex>
      <v-layout row wrap>
        <v-flex xs12 sm6 v-for="post in userPosts" :key="post._id">
          <v-card hover class="mt-3 ml-1 mr-2">
            <v-btn @click="loadPost(post)" color="info" floating fab dark small>
              <v-icon>edit</v-icon>
            </v-btn>
            <v-btn @click="handleDeleteUserPost(post)" color="warning" floating fab dark small>
              <v-icon>delete</v-icon>
            </v-btn>
            <v-img @click="goToPost(post._id)" :src="post.imageUrl" height="30vh"></v-img>
            <v-card-text>{{ post.title }}</v-card-text>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>

    <!-- Edit Post Dialog -->
    <v-dialog persistent xs12 sm6 offset-sm3 v-model="editPostDialog">
      <v-card>
        <v-card-title class="headline grey lighten-2">Update Post</v-card-title>
        <v-container>
          <v-form
            v-model="isFormValid"
            lazy-validation
            ref="form"
            @submit.prevent="handleUpdateUserPost"
          >
            <!-- Title Input -->
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  v-model="title"
                  label="Post Title"
                  type="text"
                  required
                  :rules="titleRules"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <!-- Image Input -->
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  v-model="imageUrl"
                  label="Image URL"
                  type="text"
                  required
                  :rules="imageRules"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <!-- Image Preview -->
            <v-layout>
              <v-flex v-if="imageUrl !== ''" xs12>
                <img :src="imageUrl" height="300px" alt="Image Preview">
              </v-flex>
            </v-layout>
            <!-- Categories Select -->
            <v-layout>
              <v-flex xs12>
                <v-select
                  v-model="categories"
                  :items="['Art', 'Education', 'Sports', 'Photography', 'Nature', 'Technology']"
                  multiple
                  label="Categories"
                  :rules="categoriesRules"
                ></v-select>
              </v-flex>
            </v-layout>
            <!-- Description Text Area -->
            <v-layout>
              <v-flex xs12>
                <v-textarea
                  :rules="descriptionRules"
                  v-model="description"
                  label="Post Description"
                  type="text required"
                ></v-textarea>
              </v-flex>
            </v-layout>
            <!-- save or delete -->
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn :disabled="!isFormValid" type="submit" class="success--text" flat>Update</v-btn>
              <v-btn @click="editPostDialog = false" class="error--text" flat>Cancel</v-btn>
            </v-card-actions>
          </v-form>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";

export default {
  name: "Profile",
  data() {
    return {
      editPostDialog: false,
      isFormValid: true,
      title: "",
      imageUrl: "",
      categories: [],
      description: "",
      categoriesRules: [
        categories =>
          categories.length >= 1 || "At least one category is required."
      ],
      descriptionRules: [
        description => !!description || "Please enter a description",
        description =>
          description.length < 200 ||
          "Description must be less than 200 characters."
      ],
      imageRules: [imageUrl => !!imageUrl || "Please enter an image URL"],
      titleRules: [
        title => !!title || "Please enter a title.",
        title => title.length < 32 || "Title must be less than 32 characters."
      ]
    };
  },
  computed: {
    ...mapGetters(["user", "userFavorites", "userPosts"])
  },
  created() {
    this.handleGetUserPosts();
  },
  methods: {
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`);
    },
    formatJoinDate(date) {
      return moment(new Date(date)).format("ll");
    },
    handleGetUserPosts() {
      this.$store.dispatch("getUserPosts", {
        userId: this.user._id
      });
    },
    handleDeleteUserPost(post) {
      this.loadPost(post, false);
      const deletePost = window.confirm(
        "Are you sure you want to delete this post?"
      );
      if (deletePost) {
        this.$store.dispatch("deleteUserPost", {
          postId: this.postId
        });
      }
    },
    handleUpdateUserPost() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("updateUserPost", {
          postId: this.postId,
          userId: this.user._id,
          title: this.title,
          imageUrl: this.imageUrl,
          categories: this.categories,
          description: this.description
        });
        this.editPostDialog = false;
      }
    },
    loadPost(
      { _id, title, imageUrl, categories, description },
      editPostDialog = true
    ) {
      this.editPostDialog = editPostDialog;
      this.postId = _id;
      this.title = title;
      this.imageUrl = imageUrl;
      this.categories = categories;
      this.description = description;
    }
  }
};
</script>

<style scoped>
</style>