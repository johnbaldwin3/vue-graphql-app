<template>
  <v-container text-xs-center class="mt-5">
    <!-- Add Post Title -->
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1 class="primary--text" color="info">Create a new Post</h1>
      </v-flex>
    </v-layout>

    <!-- Add Post Form -->
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleAddPost">
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
            <v-flex xs12>
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
          <!-- Submit Button -->
          <v-layout row>
            <v-flex xs12>
              <v-btn
                :disabled="!isFormValid || loading"
                :loading="loading"
                color="info"
                type="submit"
              >
                <span slot="loader" class="custom-loader">
                  <v-icon light>cached</v-icon>
                </span>
                Submit
              </v-btn>
            </v-flex>
          </v-layout>
        </v-form>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "AddPost",
  data() {
    return {
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
    ...mapGetters(["loading", "user"])
  },
  methods: {
    handleAddPost() {
      if (this.$refs.form.validate()) {
        //add post action
        this.$store.dispatch("addPost", {
          title: this.title,
          imageUrl: this.imageUrl,
          categories: this.categories,
          description: this.description,
          creatorId: this.user._id
        });
      }
      this.$router.push("/");
    }
  }
};
</script>

<style scoped>
</style>