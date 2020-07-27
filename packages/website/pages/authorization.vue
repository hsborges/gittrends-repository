<template>
  <div class="content flex flex-col flex-grow w-full items-center md:mb-24">
    <article v-if="success" class="flex flex-col flex-grow w-5/6 items-center justify-center mb-24">
      <div class="flex items-center text-3xl md:text-4xl font-bold pb-12">
        <span class="text-center">
          Hey {{ login }}, thank you very much for your contribution
          <i class="far fa-smile-wink text-3xl"></i>
        </span>
      </div>
      <a
        href="/"
        class="bg-secondary-lighter rounded rounded-md text-white font-bold text-2xl px-3 py-1"
      >
        <i class="fas fa-home pr-1"></i>Home
      </a>
    </article>
    <article v-else class="flex flex-col md:flex-row flex-grow w-5/6 items-center">
      <div class="flex flex-col flex-grow items-center">
        <span class="text-2xl md:text-4xl max-w-2md pt-8 pb-6 text-center">
          Donate and GitHub access token \o/
        </span>
        <span class="text-lg md:text-xl max-w-md text-center">
          We make thousands of GitHub API requests to keep our database updated. With more tokens we
          can add expand our dataset and speedup the data processing.
        </span>
        <a
          class="text-xl my-8 rounded text-white font-bold bg-primary py-2 px-8 hover:bg-primary-dark"
          :href="authorization_url"
          target="_blank"
        >
          <i class="fab fa-github"></i> Authorize
        </a>
        <span class="text-sm text-center">
          * you can revoke this authorization later on the GitHub website
        </span>
      </div>
      <img class="flex w-2/3 flex-shrink max-w-sm" src="@/assets/images/github-robot.png" />
    </article>
  </div>
</template>

<script>
import { stringify } from 'querystring';

export default {
  data() {
    return {
      success: this.$route.query.success,
      login: this.$route.query.login,
      authorization_url: `https://github.com/login/oauth/authorize?${stringify({
        client_id: process.env.githubClientID,
        scope: 'public_repo read:org read:user user:email'
      })}`
    };
  },
  mounted() {
    if (this.success) {
      this.$emit('dismissAlert');
      this.$cookies.set('token-donated', true, { maxAge: 60 * 60 * 24 * 30 });
    }
  }
};
</script>
