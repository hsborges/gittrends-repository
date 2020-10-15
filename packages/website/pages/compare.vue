<template>
  <div class="flex flex-col flex-grow justify-center items-center">
    <div
      class="flex flex-col w-11/12 sm:w-1/2 pt-6 pb-8"
      :class="{ 'flex-grow justify-center': !hasRepositories }"
    >
      <label
        class="text-center text-2xl sm:text-3xl text-primary font-bold leading-normal pb-2"
        :class="{ 'pb-8': !hasRepositories }"
        for="search-box"
      >
        Find a repository to compare
      </label>
      <Search
        id="search-box"
        ref="searchBar"
        class="h-10 py-2 px-4 rounded-lg"
        placeholder="Project name (e.g., twbs/bootstrap)"
        @search="find"
      ></Search>
      <span v-if="message" class="text-center text-red-300">{{ message }}</span>
      <span
        v-if="hasSuggestions"
        class="flex text-center text-sm sm:text-base text-secondary-500 sm:-mx-12"
        :class="`pt-${hasRepositories ? 2 : 4}`"
      >
        <div
          class="flex flex-grow flex-wrap justify-center"
          :class="{ 'flex-col pt-8': hasExamples }"
        >
          <span class="font-bold pr-1">
            {{ hasExamples ? 'Examples:' : 'Suggestions:' }}
          </span>
          <span
            v-for="(suggestion, i) in suggestions"
            :key="i"
            class="cursor-pointer hover:underline px-1"
            @click="addSuggestions(suggestion)"
            v-html="suggestion.text"
          >
          </span>
        </div>
      </span>
    </div>
    <div class="flex w-11/12 sm:w-5/6" :class="{ hidden: !hasRepositories && !loading }">
      <table class="table-fixed w-full">
        <thead>
          <tr>
            <th class="w-8 sm:w-32"></th>
            <th
              v-for="(repo, i) in repositories"
              :key="i"
              class="py-1 pr-1 sm:py-2 text-base leading-loose"
              :class="`w-1/${repositories.length}`"
            >
              <div
                v-if="repo"
                class="flex flex-col justify-center items-center"
                :title="repo.name_with_owner"
              >
                <object :data="repo.open_graph_image_url" type="image/png" class="w-12 h-auto" />
                <span class="text-sm sm:text-base leading-none py-2">
                  {{ repo.name_with_owner }}
                  <br />
                  <a
                    title="Go to repository details"
                    class="text-sm cursor-pointer pl-1"
                    :href="`/explorer/${repo.name_with_owner}`"
                    :target="repo.id"
                  >
                    <i class="pt-1 fas fa-external-link-alt"></i>
                  </a>
                  <a
                    title="Remove"
                    class="text-sm cursor-pointer text-red-400 pl-1"
                    @click="remove(repo.name_with_owner)"
                  >
                    <i class="pt-1 fas fa-trash-alt"></i>
                  </a>
                </span>
              </div>
            </th>
            <th v-if="loading" :class="`w-1/${repositories.length}`">
              <i class="fas fa-spinner fa-spin"></i>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="field in fields" :key="field.text">
            <td class="text-right pr-4 py-2 border-r font-bold">
              <i :class="field.icon"></i>
              <span class="hidden sm:inline pl-2">{{ field.text }}</span>
            </td>
            <td
              v-for="(repo, i) in repositories"
              :key="i"
              class="text-center border text-sm sm:text-base"
            >
              <span v-if="repo" :title="field.title && field.title(repo)">
                {{ field.value(repo) }}
              </span>
            </td>
          </tr>
          <tr>
            <td class="text-right pr-4 py-2 border-r font-bold">
              <i class="fas fa-chart-line"></i>
              <span class="hidden sm:inline pl-2">Popularity</span>
            </td>
            <td class="border-t border py-8 h-24" :colspan="repositories.length">
              <Timeseries ref="stargazersChart" :repository="null" :timeseries="null"> </Timeseries>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Share></Share>
    <Love class="flex flex-grow items-end mt-10"></Love>
  </div>
</template>

<script>
import qs from 'querystring';
import numeral from 'numeral';
import moment from 'moment';
import _ from 'lodash';

import Love from '@/components/Love.vue';
import Search from '@/components/SearchBox.vue';
import Share from '@/components/ShareButton.vue';
import Timeseries from '@/components/StargazersTimeseries.vue';

export default {
  components: { Love, Search, Timeseries, Share },
  data() {
    return {
      repositories: [],
      query: null,
      message: null,
      suggestions: [],
      loading: false,
      fields: [
        {
          text: 'Language',
          icon: 'fas fa-code',
          value: (r) => r.primary_language || '-'
        },
        {
          text: 'Stargazers',
          icon: 'fas fa-star',
          value: (r) => numeral(r.stargazers_count).format('0,0')
        },
        {
          text: 'Forks',
          icon: 'fas fa-network-wired',
          value: (r) => numeral(r.forks_count).format('0,0')
        },
        {
          text: 'Archived',
          icon: 'fas fa-archive',
          value: (r) => (r.is_archived ? 'Yes' : 'No')
        },
        {
          text: 'Created',
          icon: 'fas fa-rocket',
          value: (r) => moment(r.created_at).fromNow(),
          title: (r) => moment(r.created_at).format('LLL')
        },
        {
          text: 'Last push',
          icon: 'fas fa-arrow-alt-circle-up',
          value: (r) => moment(r.pushed_at).fromNow(),
          title: (r) => moment(r.pushed_at).format('LLL')
        },
        {
          text: 'License',
          icon: 'far fa-copyright',
          value: (r) => (r.license_info ? _.toUpper(r.license_info) : '-')
        },
        {
          text: 'Code of Conduct',
          icon: 'fas fa-hands-helping',
          value: (r) => (r.code_of_conduct ? _.startCase(r.code_of_conduct) : '-')
        }
      ]
    };
  },
  computed: {
    hasRepositories() {
      return this.repositories && this.repositories.length > 0;
    },
    hasSuggestions() {
      return this.suggestions && this.suggestions.length > 0;
    },
    hasExamples() {
      return this.hasSuggestions && this.suggestions[0].repos;
    }
  },
  mounted() {
    const names = _.reduce(
      this.$route.query,
      (a, v, k) => {
        if (k.indexOf('repo') === 0) return a.concat(v);
        return a;
      },
      []
    );

    this.$nextTick(() => {
      if (names && names.length) return Promise.all(names.map((name) => this.add(name)));
      return this.suggest();
    });
  },
  methods: {
    async suggest() {
      this.suggestions = await this.$axios
        .get(`/api/search/repos?${qs.encode({ query: '', limit: 6, random: _.random(5) })}`)
        .then(({ data }) => {
          const repos = _.shuffle(data.repositories);
          const suggestions = [];
          for (let i = 0; i < Math.ceil(repos.length / 2); i += 1) {
            const r1 = repos[i];
            const r2 = repos[repos.length - i - 1];

            suggestions.push({
              text: `${r1.name_with_owner} &#8644; ${r2.name_with_owner}`,
              repos: [r1, r2]
            });
          }

          return suggestions.sort((a, b) => a.text.length - b.text.length);
        });
    },
    updateUrl() {
      const query = this.repositories.reduce(
        (m, r, i) => ({ ...m, [`repo${i + 1}`]: r.name_with_owner }),
        {}
      );
      if (!_.isEqual(query, this.$route.query)) this.$router.replace({ query });
    },
    addSuggestions(suggestion) {
      if (suggestion.repo) return this.add(suggestion.repo.name_with_owner);
      return Promise.all(suggestion.repos.map((repo) => this.add(repo.name_with_owner)));
    },
    async add(nameWithOwner) {
      if (this.repositories.find((r) => r.name_with_owner === nameWithOwner))
        return this.showMessage('Repository already added!');

      if (this.repositories.length === 6)
        return this.showMessage('Remove one repository before adding new ones.');

      this.suggestions = null;
      this.message = null;
      this.loading = true;

      const repo = await this.$axios(`/api/repos/${nameWithOwner}`).then(({ data }) => ({
        ...data,
        name: _.startCase(data.name)
      }));

      this.loading = false;
      this.repositories.push(repo);
      this.$refs.searchBar.clear();

      if (repo._metadata.stargazers) {
        await this.$axios(`/api/repos/${nameWithOwner}/stargazers`).then(({ data }) =>
          this.$refs.stargazersChart.addTimeseries(nameWithOwner, data.timeseries)
        );
      } else {
        this.showMessage(`Stargazers timeseries missing for ${repo.name_with_owner} :(`);
      }

      return this.updateUrl();
    },
    remove(nameWithOwner) {
      this.repositories = this.repositories.filter((r) => r.name_with_owner !== nameWithOwner);
      this.$refs.stargazersChart.removeTimeseries(nameWithOwner);
      this.updateUrl();
      if (!this.repositories.length) this.suggest();
    },
    showMessage(text) {
      this.message = text;
      setTimeout(() => (this.message = null), 3000);
    },
    async find(v) {
      if (!v) return;

      if (v.length < 3) {
        this.showMessage('You must provide at least 4 characters');
        return;
      }

      this.suggestions = null;
      this.message = null;
      const name = v.trim().toLowerCase();

      const { repositories } = await this.$axios(
        `/api/search/repos?${qs.encode({ query: name, limit: 5 })}`
      ).then(({ data }) => data);

      if (!repositories.length) {
        this.showMessage('No repositories found for this query :(');
      } else if (name === repositories[0].name_with_owner.toLowerCase()) {
        await this.add(repositories[0].name_with_owner);
        this.$refs.searchBar.clear();
      } else {
        this.suggestions = repositories
          .sort((a, b) => a.name_with_owner.length - b.name_with_owner.length)
          .map((r) => ({ text: r.name_with_owner, repo: r }));
      }
    }
  }
};
</script>
