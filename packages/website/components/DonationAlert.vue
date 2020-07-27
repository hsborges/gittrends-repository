<template>
  <div v-if="showAlert" class="flex justify-center w-full h-6 bg-secondary-dark z-50">
    <nuxt-link class="text-white text-center font-bold hover:cursor-pointer" to="/authorization">
      <i class="fas fa-bullhorn px-1"></i>
      <span class="hidden md:inline leading-normal">
        Hey, we need your support to expand our database. Click here to donate a GitHub access token
      </span>
      <span class="md:hidden text-sm leading-normal">
        Enjoying? Donate a access token
      </span>
      \o/
    </nuxt-link>
    <i
      class="fas fa-times text-white absolute right-0 leading-normal px-2 cursor-pointer"
      @click="dismissAlert"
    ></i>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showAlert: !(this.$cookies.get('token-donated') || this.$cookies.get('alert-dismissed'))
    };
  },
  methods: {
    dismissAlert() {
      this.showAlert = false;
      this.$cookies.set('alert-dismissed', true, { maxAge: 300 });
    }
  }
};
</script>

<style></style>
