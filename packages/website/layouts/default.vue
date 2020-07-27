<template>
  <div class="flex flex-col h-screen">
    <Alert />
    <div class="flex flex-col flex-grow lg:flex-row max-w-full">
      <Menu />
      <Nuxt />
    </div>
  </div>
</template>

<script>
import Alert from '@/components/DonationAlert.vue';
import Menu from '@/components/NavigationBar.vue';

export default {
  components: { Alert, Menu }
};
</script>

<style lang="stylus">
@import url('https://fonts.googleapis.com/css?family=PT+Sans:400,700&display=swap');

html {
  font-family: 'PT Sans', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  max-width: 100vw;
  min-height: 100vh;
  font-size: 16px;
  word-spacing: 1px;
  scroll-behavior: smooth;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;

  @apply text-secondary;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
</style>
