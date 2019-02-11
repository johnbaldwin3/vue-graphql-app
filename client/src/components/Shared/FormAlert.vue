<template>
  <v-container>
    <v-alert type="error" transition="scale-transition" :value="true" dismissible>
      <h3>{{message}}</h3>
    </v-alert>
  </v-container>
</template>

<script>
export default {
  props: ["message"]
};
</script>

<style scoped>
</style>