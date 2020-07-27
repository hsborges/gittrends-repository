<template>
  <div class="flex flex-wrap justify-between md:justify-start items-center w-full py-4">
    <div
      v-for="field in fields"
      :key="field.text"
      class="md:flex-block w-1/2 md:w-1/4 py-2 md:py-3 px-4"
      :class="{
        hidden: !field.value || field.value == 0,
        'w-full': field.value && field.value.length > 25
      }"
      :title="field.title"
    >
      <span class="block text-sm md:text-center md:-ml-2">
        <i class="text-xs" :class="field.icon"></i>
        {{ field.text }}
      </span>
      <a
        class="block md:text-base font-bold md:text-center whitespace-normal"
        :class="{ underline: field.url, 'text-primary': field.url }"
        :href="field.url"
        target="_blank"
      >
        {{ field.value }}
      </a>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import numeral from 'numeral';
import moment from 'moment';

export default {
  props: {
    repository: { type: Object, default: null }
  },
  data() {
    return {
      fields: [
        {
          text: 'Language',
          icon: 'fas fa-code',
          value: this.repository.primary_language
        },
        {
          text: 'Owner',
          icon: 'fas fa-user-ninja',
          value: this.repository.owner.login,
          url: `https://github.com/${this.repository.owner.login}`
        },
        {
          text: 'Homepage',
          icon: 'fas fa-home',
          value: this.repository.homepage || this.repository.name_with_owner,
          url: this.repository.homepage || `https://github.com/${this.repository.name_with_owner}`
        },
        {
          text: 'Stargazers',
          icon: 'fas fa-star',
          value: numeral(this.repository.stargazers_count).format('0,0')
        },
        {
          text: 'Forks',
          icon: 'fas fa-network-wired',
          value: numeral(this.repository.forks_count).format('0,0')
        },
        {
          text: 'Watchers',
          icon: 'fas fa-eye',
          value: numeral(this.repository.watchers_count).format('0,0')
        },
        {
          text: 'Tags',
          icon: 'fas fa-tag',
          value: numeral(this.repository.tags_count).format('0,0')
        },
        {
          text: 'Releases',
          icon: 'fas fa-bullhorn',
          value: numeral(this.repository.releases_count).format('0,0')
        },
        {
          text: 'Default branch',
          icon: 'fas fa-code-branch',
          value: this.repository.default_branch
        },
        {
          text: 'Archived',
          icon: 'fas fa-archive',
          value: this.repository.archived
        },
        {
          text: 'Created',
          icon: 'fas fa-rocket',
          value: moment(this.repository.created_at).fromNow(),
          title: moment(this.repository.created_at).format('LLL')
        },
        {
          text: 'Last push',
          icon: 'fas fa-arrow-alt-circle-up',
          value: moment(this.repository.pushed_at).fromNow(),
          title: moment(this.repository.pushed_at).format('LLL')
        },
        {
          text: 'License',
          icon: 'far fa-copyright',
          value: _.toUpper(this.repository.license || '')
        },
        {
          text: 'Code of Conduct',
          icon: 'fas fa-hands-helping',
          value: _.startCase(this.repository.code_of_conduct || '')
        },
        {
          text: 'Last update',
          icon: 'far fa-clock',
          value: moment(this.repository.updated_at).fromNow(),
          title: moment(this.repository.updated_at).format('LLL')
        }
      ]
    };
  }
};
</script>
