<template>
  <div class="flex flex-col md:flex-row w-full py-5 md:py-6 h-full">
    <div v-if="timeseries" class="flex flex-col justify-center items-center w-full md:w-4/6">
      <Timeseries
        ref="timeseriesChart"
        :repository="repository"
        :timeseries="timeseries"
        :hide-legend="true"
      ></Timeseries>
    </div>
    <div
      v-if="timeseries"
      class="flex w-full md:w-2/6 justify-center items-center md:items-stretch pt-6"
    >
      <table class="flex table table-auto w-11/12 text-base">
        <tbody>
          <tr class="border-b">
            <td class="border-r font-bold align-top">Last week</td>
            <td v-if="timeseries" class="px-2">
              {{ formatNumber(getStargazersLastWeek()) }} stars
            </td>
          </tr>
          <tr class="border-b">
            <td class="border-r font-bold align-top">Last month</td>
            <td v-if="timeseries" class="px-2">
              {{ formatNumber(getStargazersLastMonth()) }} stars
            </td>
          </tr>
          <tr v-if="peak" class="border-b">
            <td class="border-r font-bold align-top">Peak (week)</td>
            <td class="px-2">
              {{ formatNumber(peak.stargazers) }} stars
              <br />
              <small>({{ formatDate(peak.date) }})</small>
            </td>
          </tr>
          <tr v-if="first" class="border-b">
            <td class="border-r font-bold align-top">Oldest</td>
            <td class="flex flex-shrink-0">
              <img :src="first.user.avatar_url" class="rounded mr-2 opacity-80 m-1 w-12 h-12" />
              <div class="flex-grow">
                <a :href="`https://github.com/${first.user.login}`" target="_blank" class="block">
                  {{ first.user.login }}
                </a>
                <small class="block">
                  {{ formatDate(first.starred_at, true) }}
                </small>
              </div>
            </td>
          </tr>
          <tr v-if="last">
            <td class="border-r font-bold align-top">Newest</td>
            <td class="flex flex-shrink-0">
              <img :src="last.user.avatar_url" class="rounded mr-2 opacity-80 m-1 w-12 h-12" />
              <div class="flex-grow">
                <a :href="`https://github.com/${last.user.login}`" target="_blank" class="block">
                  {{ last.user.login }}
                </a>
                <small class="block">
                  {{ formatDate(last.starred_at, true) }}
                </small>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <Loading v-else class="flex flex-grow h-40"></Loading>
  </div>
</template>

<script>
import moment from 'moment';
import numeral from 'numeral';

import Loading from '@/components/Loading.vue';
import Timeseries from '@/components/StargazersTimeseries.vue';

export default {
  components: { Loading, Timeseries },
  props: {
    repository: { type: String, required: true }
  },
  data() {
    return {
      timeseries: null,
      first: null,
      last: null,
      peak: null
    };
  },
  async created() {
    await this.$axios(`/api/repos/${this.repository}/stargazers`).then(({ data }) => {
      if (!(data && Object.keys(data.timeseries).length)) return;

      this.timeseries = data.timeseries;

      const [date, stargazers] = Object.entries(this.timeseries).reduce(
        (m, s) => (m[1] > s[1] ? m : s),
        []
      );
      this.peak = { date, stargazers };

      Promise.all([
        this.$axios(`/api/users/${data.first.user}`).catch(() => null),
        this.$axios(`/api/users/${data.last.user}`).catch(() => null)
      ]).then(([first, last]) => {
        this.first = { ...data.first, user: first && first.data };
        this.last = { ...data.last, user: last && last.data };
      });
    });
  },
  methods: {
    formatDate: (d, f) => moment.parseZone(d).format(`ll${f ? 'l' : ''}`),
    formatNumber: (n) => numeral(n).format('0,0'),
    getStargazersLastWeek() {
      return Object.values(this.timeseries).slice(-2)[0];
    },
    getStargazersLastMonth() {
      return Object.values(this.timeseries)
        .slice(-5)
        .slice(0, -1)
        .reduce((m, v) => m + v, 0);
    }
  }
};
</script>

<style lang="stylus" scoped>
a
  @apply text-primary-dark font-bold font-bold underline;
</style>
