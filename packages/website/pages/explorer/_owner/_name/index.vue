<template>
  <div class="details flex-block w-11/12 lg:w-4/6">
    <div v-if="repository" class="flex flex-col border border-secondary-200 rounded">
      <div class="header flex-block py-4 px-2 bg-primary text-center">
        <p class="text-xl font-bold text-white">
          <i class="fab fa-github px-2"></i>
          {{ repository.name_with_owner }}
        </p>
        <p class="text-sm md:text-base text-white pt-2 md:pt-0">
          {{ repository.description }}
        </p>
      </div>
      <div class="overview flex flex-col items-center">
        <h1>I. Overview</h1>
        <Overview v-if="repository" :repository="repository"></Overview>
      </div>
      <div class="stargazers flex flex-col flex-grow">
        <h1>II. Popularity</h1>
        <div class="flex flex-grow justify-center">
          <Stargazers
            v-if="repository._metadata && repository._metadata.stargazers"
            :repository="repository.name_with_owner"
          ></Stargazers>
          <NotAvailable v-else></NotAvailable>
        </div>
      </div>
      <div class="stargazers flex flex-col flex-grow">
        <h1>III. Promotion on Social Media Sites</h1>
        <div class="flex flex-col items-center justify-center py-8">
          <i class="text-center fas fa-bullhorn text-4xl text-primary"></i>
          <p class="w-5/6 text-center pt-4">
            Promotion on social media sites is essentially important to achieve a large number of
            developers. We are currently processing posts on social media sites, such as HN and
            Reddit, to bring insights on the most effective posts (i.e., those with most upvotes).
          </p>
        </div>
      </div>
    </div>
    <Loading v-else class="flex flex-grow h-40"></Loading>
  </div>
</template>

<script>
import Loading from '@/components/Loading.vue';
import NotAvailable from '@/components/NotAvailable.vue';
import Overview from '@/components/explorer/RepositoryOverview.vue';
import Stargazers from '@/components/explorer/RepositoryStargazersTimeseries.vue';

export default {
  components: { Loading, NotAvailable, Overview, Stargazers },
  data() {
    return {
      repository: null
    };
  },
  async created() {
    const { owner, name } = this.$route.params;
    const { data } = await this.$axios.get(`/api/repos/${owner}/${name}`);
    this.repository = data;
  }
};
</script>

<style lang="stylus" scoped>
.details
  margin: 5vh auto;

  h1
    @apply: flex font-bold justify-center w-full px-4 bg-primary-100;
    @apply: border-b border-t border-secondary-200;
</style>
