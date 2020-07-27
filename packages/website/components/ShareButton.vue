<template>
  <a class="btn hidden" @click="share">
    <i class="fab fa-twitter"></i> <span class="hidden pl-2">Share</span>
  </a>
</template>

<script>
import qs from 'querystring';

export default {
  computed: {
    baseUrl() {
      return (
        `${window.location.protocol}//${window.location.hostname}` +
        (window.location.port ? `:${window.location.port}` : '')
      );
    },
    url() {
      return qs.encode({
        text:
          'Hey, have a look at this amazing tool. They provide useful insights on popular open source projects hosted on GitHub.',
        url: this.baseUrl + this.$route.fullPath
      });
    }
  },
  methods: {
    share() {
      window.open(
        `https://twitter.com/intent/tweet?${this.url}`,
        '_blank',
        'resizable,scrollbars,status,width=650,height=350'
      );
    }
  }
};
</script>

<style lang="stylus" scoped>
.btn
  @apply fixed right-0 bottom-0 flex justify-center items-center;
  @apply mb-5 h-12 w-12 pl-2;
  @apply rounded-l-full bg-primary text-white font-bold text-xl;
  &:hover
    @apply w-auto pl-4 pr-2 cursor-pointer;
    span
      @apply inline;

@media (max-width: 400px)
  .btn
    @apply h-10 w-10 pl-1;
    @apply text-lg;
    &:hover
      @apply w-auto pl-4 pr-2 cursor-pointer;
      span
        @apply inline;
</style>
