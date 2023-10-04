

export const schemas = {
    "Basic Line Chart": `{
      "dataset": {
        "dimensions": ["Weekday", "Data"],
        "source": [
          ["Mon", 150],
          ["Tue", 230],
          ["Wed", 224],
          ["Thu", 218],
          ["Fri", 135],
          ["Sat", 147],
          ["Sun", 260]
        ]
      },
      "xAxis": {
        "type": "category"
      },
      "yAxis": {
        "type": "value"
      },
      "series": [
        {
          "encode": { "x": "Weekday", "y": "Data" },
          "type": "line"
        }
      ]
    }`,
    "Smoothed Line Chart": `{
      "dataset": {
        "dimensions": ["Weekday", "Data"],
        "source": [
          ["Mon", 150],
          ["Tue", 230],
          ["Wed", 224],
          ["Thu", 218],
          ["Fri", 135],
          ["Sat", 147],
          ["Sun", 260]
        ]
      },
      "xAxis": {
        "type": "category"
      },
      "yAxis": {
        "type": "value"
      },
      "series": [
        {
          "encode": { "x": "Weekday", "y": "Data" },
          "type": "line",
          "smooth": true
        }
      ]
    }`,
}