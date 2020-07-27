<template>
  <div class="flex w-full flex-col flex-grow items-center justify-center pb-20 lg:pb-48">
    <span class="status text-primary font-bold">404</span>
    <span class="message text-secondary -mt-4 lg:-mt-10">Not Found :(</span>
  </div>
</template>

<script>
export default {};
</script>

<style lang="stylus" scoped>
.status
  font-size: 6em;
.message
  font-size: 3em;

@media (max-width: 1024px)
  .status
    font-size: 4em;
  .message
    font-size: 2em;
</style>
