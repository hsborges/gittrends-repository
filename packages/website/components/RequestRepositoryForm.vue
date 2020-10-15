<template>
  <div
    v-if="visible"
    class="fixed flex items-center justify-center bg-secondary top-0 left-0 w-full h-full"
  >
    <div class="relative form w-full sm:w-2/3 pr-24 pt-12 pb-8 -mt-24 bg-white">
      <i
        class="absolute right-0 top-0 fas fa-times cursor-pointer mt-2 mr-2"
        @click.prevent="hide()"
      ></i>
      <div v-if="request && !request.success">
        <div class="md:flex md:items-center mb-3">
          <div class="md:w-1/4 md:text-right">
            <label for="repository">Repository*</label>
          </div>
          <div class="md:w-3/4">
            <input id="repository" v-model="request.repository" placeholder="owner/name" />
          </div>
        </div>
        <div class="md:flex md:items-center mb-3">
          <div class="md:w-1/4 md:text-right">
            <label for="inline-username">Notify-me</label>
          </div>
          <div class="md:w-3/4">
            <input v-model="request.email" type="email" placeholder="my@email.com" />
          </div>
        </div>
        <div v-if="request.feedback" class="md:flex md:items-center">
          <div class="md:w-full text-right text-red-500">* {{ request.feedback }}</div>
        </div>
        <div class="md:flex md:items-center">
          <div class="md:w-1/4"></div>
          <div class="md:w-3/4 md:text-left">
            <button class="float-right" type="button" @click="sendRequest">
              <i
                class="fas pr-1"
                :class="{
                  'fa-paper-plane': !request.sending,
                  'fa-spinner fa-spin': request.sending
                }"
              ></i>
              Send Request
            </button>
          </div>
        </div>
      </div>
      <a v-if="request && request.success" href="/authorize" target="_blank" class="pt-4">
        Suggestion sent, please consider donate a GitHub access token :)
      </a>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  data() {
    return {
      visible: false,
      request: {
        repository: null,
        email: null,
        feedback: null,
        sending: null,
        success: null
      }
    };
  },
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    async sendRequest() {
      if (!this.request.repository) {
        this.request.feedback = 'Repository is a mandatory field!';
        return;
      }

      if (!/.+\/.+/gi.test(this.request.repository)) {
        this.request.feedback = 'Invalid repository format!';
        return;
      }

      this.request.sending = true;
      await this.axios(`https://api.github.com/repos/${this.request.repository}`)
        .catch((res) => {
          if (res.response && res.response.status !== 404) return Promise.resolve();
          throw res;
        })
        .then(() =>
          this.axios({
            method: 'POST',
            url: '/request/repository',
            data: _.pick(this.request, ['repository', 'email']),
            timeout: 10000
          }).then(() => (this.request.success = true))
        )
        .catch((res) => {
          if (
            res.response &&
            res.response.status === 404 &&
            res.response.config.url.indexOf('api.github.com')
          )
            return (this.request.feedback = 'Repository not found (only public are accepted).');
          return (this.request.feedback = 'An error has occurred, please try later.');
        });

      this.request.sending = false;
    }
  }
};
</script>

<style lang="stylus" scoped>
.form
  input
    @apply: bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-4 text-gray-700 leading-tight;
    &:focus
      @apply: border-primary bg-white;

  label
    @apply: block text-gray-500 font-bold mb-0 pr-4;

  button
    @apply: shadow bg-primary-lighter text-white font-bold py-1 px-4 mt-2 rounded;
    &:hover
      @apply: bg-primary;
</style>
