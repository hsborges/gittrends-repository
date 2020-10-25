<template>
  <div class="flex flex-col w-full">
    <canvas id="chart" :height="height"></canvas>
    <div class="flex justify-center w-full pt-2">
      <span class="font-bold">Stargazers:</span>
      <select v-model="type" class="bg-transparent border-transparent">
        <option value="cumulative">Cumulative</option>
        <option value="gained">Gained</option>
      </select>
      <span class="px-1 sm:px-4">-</span>
      <span class="font-bold">Scale:</span>
      <select v-model="scale" class="bg-transparent border-transparent">
        <option value="linear">Linear</option>
        <option value="logarithmic">Log</option>
      </select>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';

import 'chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes';
import { SetTwo8 } from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.brewer';

SetTwo8[0] = '#68b2b1';

export default {
  props: {
    repository: { type: String, default: null },
    timeseries: { type: Object, default: null },
    hideLegend: { type: Boolean, default: false }
  },
  data() {
    return {
      chart: null,
      series: {},
      type: 'cumulative',
      scale: 'linear'
    };
  },
  computed: {
    height() {
      return process.client && window.innerWidth < 400 ? '250px' : '';
    },
    fontSize() {
      return process.client && window.innerWidth < 400 ? 10 : 12;
    }
  },
  watch: {
    scale() {
      this.chart.options.scales.yAxes[0].type = this.scale;
      this.chart.update();
    },
    type() {
      this.updateDatasets();
      this.chart.update();
    },
    series() {
      this.updateDatasets();
      this.chart.update();
    }
  },
  created() {
    Chart.Legend.prototype.afterFit = function () {
      this.height += 15;
    };
  },
  mounted() {
    this.chart = new Chart('chart', {
      type: 'line',
      data: {
        datasets: []
      },
      options: {
        legend: {
          display: !this.hideLegend,
          labels: { boxWidth: 20, fontSize: this.fontSize }
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              time: {
                displayFormats: { unit: 'day' },
                tooltipFormat: 'll'
              },
              gridLines: { drawOnChartArea: false }
            }
          ],
          yAxes: [
            {
              type: this.scale,
              ticks: { min: 0 },
              gridLines: { drawOnChartArea: false }
            }
          ]
        },
        elements: { point: { radius: 0, hitRadius: 0.5 } },
        tooltips: {
          mode: 'x',
          intersect: false,
          position: 'nearest',
          itemSort: (a, b) => b.value - a.value
        },
        plugins: {
          colorschemes: { scheme: SetTwo8 }
        }
      }
    });

    if (this.repository) {
      this.type = 'gained';
      this.scale = 'logarithmic';
      this.addTimeseries(this.repository, this.timeseries);
    }
  },
  methods: {
    addTimeseries(repository, timeseries) {
      this.series = {
        ...(this.series || {}),
        [repository]: timeseries
      };
    },
    removeTimeseries(repo) {
      if (Array.isArray(repo)) repo.forEach((r) => this.removeRepository(r));
      else delete this.series[repo];
    },
    updateDatasets() {
      while (this.chart.data.datasets.length) this.chart.data.datasets.pop();
      Object.keys(this.series).forEach((repo) =>
        this.chart.data.datasets.push({
          label: repo,
          fill: false,
          data: this.transform(this.series[repo])
        })
      );
    },
    transform(stargazers) {
      return Object.keys(stargazers)
        .reduce(
          (m, s) =>
            m.concat({
              x: new Date(s),
              y:
                stargazers[s] + (this.type === 'cumulative' && m.length > 0 ? m[m.length - 1].y : 0)
            }),
          []
        )
        .slice(0, this.type === 'cumulative' ? stargazers.length : -1);
    }
  }
};
</script>
