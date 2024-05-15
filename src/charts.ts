

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
    "Basic area chart": `{
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
          "areaStyle": {}
        }
      ]
    }`,
    "Stacked Area Chart": `{
      "dataset": {
        "dimensions": ["Weekday", "Email", "Union Ads", "Video Ads", "Direct", "Search Engine"],
        "source": [
          ["Mon", 150, 130, 180, 170, 90],
          ["Tue", 230, 210, 220, 230, 290],
          ["Wed", 224, 264, 234, 274, 24],
          ["Thu", 218, 198, 238, 208, 208],
          ["Fri", 135, 155, 105, 175, 165],
          ["Sat", 147, 187, 137, 117, 137],
          ["Sun", 260, 220, 250, 266, 255]
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
          "areaStyle": {},
          "seriesLayoutBy": "column"
        }
      ]
    }`,
    "Bump Chart (Ranking)": ''
}