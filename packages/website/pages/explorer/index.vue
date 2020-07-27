<template>
  <div class="explorer flex flex-col flex-grow items-center">
    <div v-if="filter" class="filter w-11/12 lg:w-4/6 py-2">
      <div class="inline-flex w-1/2 text-secondary text-sm md:text-base">
        <span class="py-1 pr-1 leading-tight">Language:</span>
        <select
          v-model="filter.language"
          class="appearance-none py-1 leading-tight font-bold cursor-pointer overflow-hidden bg-transparent border-0"
          @change="applyFilter()"
        >
          <option :value="undefined">All &#9662;</option>
          <option v-for="(count, lang) in (meta || []).languages_count" :key="lang" :value="lang">
            {{ lang || '_None_' }}
          </option>
        </select>
      </div>

      <div class="search flex w-1/2 md:w-1/3 float-right">
        <Search
          ref="searchBar"
          :show-clear="true"
          class="pl-1 sm:pl-2 text-sm md:text-base"
          @search="applyFilter"
          @clear="
            reset();
            applyFilter();
          "
        ></Search>
      </div>
    </div>
    <div v-if="repositories" class="items flex-block w-11/12 lg:w-4/6">
      <Request ref="modal" />
      <div v-if="!repositories.length" class="flex flex-col items-center text-center p-6 md:p-16">
        <p>
          Sorry, we did not find any repositories matching with this query.
          <br />
          <a @click.prevent="$refs.modal.show()">Click here</a> to send us a request for adding this
          repository in our database.
        </p>
      </div>
      <nuxt-link
        v-for="repo in repositories"
        :key="repo.id"
        class="item flex flex-col"
        :to="`/explorer/${repo.name_with_owner}`"
      >
        <div class="flex info">
          <div class="icon flex flex-shrink-0 w-16 items-center justify-center">
            <object :data="repo.open_graph_image_url" type="image/png" class="w-12 h-12"> </object>
          </div>
          <div class="content flex-block flex-grow py-2 pr-3">
            <p class="font-bold text-secondary">{{ repo.name_with_owner }}</p>
            <p class="text-sm text-secondary-lighter">{{ repo.description }}</p>
            <p class="counters flex text-sm text-secondary-lighter">
              <span v-if="repo.primary_language" title="Primary programming language">
                <i class="fas fa-code"></i>
                {{ repo.primary_language }}
              </span>
              <span title="Number of stars">
                <i class="fas fa-star"></i>
                {{ formatNumber(repo.stargazers_count) }}
              </span>
              <span title="Number of forks">
                <i class="fas fa-code-branch"></i>
                {{ formatNumber(repo.forks_count) }}
              </span>
              <span title="Number of watchers" class="hidden md:inline">
                <i class="fas fa-eye"></i>
                {{ formatNumber(repo.watchers_count) }}
              </span>
              <span title="Last updated at" class="hidden md:inline">
                <i class="far fa-clock"></i>
                {{ formatTime(repo.updated_at) }}
              </span>
            </p>
          </div>
        </div>
      </nuxt-link>
    </div>
    <div v-if="hasMore" class="paginator flex justify-center text-sm sm:text-base w-11/12 lg:w-4/6">
      <button
        id="loadMoreButton"
        class="w-full sm:w-1/2 mt-4 py-2 rounded-lg border-2 border-gray-300 bg-primary text-white font-bold text-center leading-tight"
        @click="loadMore"
      >
        Load more
        <i class="fas fa-sync-alt pl-1" :class="{ 'fa-spin': filter.loading }"></i>
      </button>
    </div>
    <Share></Share>
    <Love class="flex flex-grow items-end mt-10"></Love>
  </div>
</template>

<script>
import qs from 'querystring';
import _ from 'lodash';
import numeral from 'numeral';
import moment from 'moment';

import Love from '@/components/Love.vue';
import Search from '@/components/SearchBox.vue';
import Share from '@/components/ShareButton.vue';
import Request from '@/components/RequestRepositoryForm.vue';

export default {
  components: { Love, Request, Search, Share },
  data() {
    return {
      filter: null,
      repositories: null,
      meta: null
    };
  },
  computed: {
    hasMore() {
      return (
        this.meta && (this.filter.offset || 0) + this.filter.limit < this.meta.repositories_count
      );
    }
  },
  watch: {
    '$route.query'(to) {
      if (_.isEmpty(to) && (this.filter.query || this.filter.language)) {
        this.reset();
        this.applyFilter();
      }
    }
  },
  async mounted() {
    this.reset();
    this.filter = { ...this.filter, ...this.$route.query };
    await this.applyFilter().then(() => {
      this.$refs.searchBar.query = this.filter.query;
    });
  },
  methods: {
    searchQuery() {
      return qs.encode(
        _(this.filter)
          .omit(['loading'])
          .pickBy((v) => !!v)
          .value()
      );
    },
    reset() {
      this.repositories = null;
      this.filter = { limit: 25, offset: 0 };
    },
    async applyFilter(query) {
      this.filter.offset = 0;

      if (query) this.filter.query = query;

      await this.$axios(`/api/search/repos?${this.searchQuery()}`).then(
        ({ data: { repositories, meta } }) => {
          this.repositories = repositories;
          this.meta = meta;

          const queryParams = _(this.filter)
            .pick(['language', 'query'])
            .pickBy((v) => v)
            .value();

          if (!_.isEqual(this.$route.query, queryParams))
            this.$router.replace({ query: queryParams });
        }
      );
    },
    async loadMore() {
      if (!this.hasMore || this.filter.loading) return;

      this.filter.offset += this.filter.limit;
      this.filter.loading = true;

      const {
        data: { repositories, meta }
      } = await this.$axios(`/api/search/repos?${this.searchQuery()}`).finally(
        () => (this.filter.loading = false)
      );

      this.repositories = _.uniqBy(this.repositories.concat(repositories), (r) => r.id);
      this.meta = meta;
    },
    formatNumber: (v, simple) => {
      if (v < 1000 || simple) return numeral(v).format('0,0');
      return numeral(v).format('0.0a');
    },
    formatTime: (t) => {
      return moment(t).fromNow();
    }
  }
};
</script>

<style lang="stylus" scoped>
.explorer
  margin: 5vh auto 0px auto;

  .items
    @apply: border border-secondary-200 rounded;

    .item
      @apply: flex w-full border-b border-secondary-200 no-underline;
      &:hover
        @apply: cursor-pointer bg-primary-100;
      .counters span
        @apply: pr-2;

    a
      @apply: text-primary underline cursor-pointer font-bold;
</style>
