

export const schemas = {
  "Basic Line Chart": {
    "dataset": {
      "dimensions": ["Country", " Sales"],
    },
    xAxis: {
      type: 'category',
      "data": "{{{ jsonArray (map table.rows 'Country') }}}"
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        "data": "{{{ jsonArray (map table.rows ' Sales') }}}",
        type: 'line'
      }
    ]
  },
  "Smoothed Line Chart": {
    xAxis: {
      type: 'category',
      data: "{{{ jsonArray (map table.rows 'Country') }}}"
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: "{{{ jsonArray (map table.rows ' Sales') }}}",
        type: 'line',
        smooth: true
      }
    ]
  },
  "Basic area chart": {
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: "{{{jsonArray (map table.rows 'Country')}}}"
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: "{{{jsonArray (map table.rows ' Sales')}}}",
        type: 'line',
        areaStyle: {}
      }
    ]
  },
  "Stacked Line": {
    title: {
      text: 'Stacked Line'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: "{{{jsonArray (map table.rows 'Country')}}}"
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Sales',
        type: 'line',
        stack: 'Total',
        data: "{{{jsonArray (map table.rows ' Sales')}}}",
      },
      {
        name: 'Gross Sales',
        type: 'line',
        stack: 'Total',
        data: "{{{jsonArray (map table.rows 'Gross Sales')}}}",
      }
    ]
  },
  "Stacked Area Chart": {
    title: {
      text: 'Stacked Area Chart'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: "{{{jsonArray (map table.rows 'Country')}}}"
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: "{{{jsonArray (map table.rows 'Country')}}}"

      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: 'Sales',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: "{{{jsonArray (map table.rows ' Sales')}}}",
      },
      {
        name: 'Gross Sales',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: "{{{jsonArray (map table.rows 'Gross Sales')}}}",

      }
    ]
  }
}