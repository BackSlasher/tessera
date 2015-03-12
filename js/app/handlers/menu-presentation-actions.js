ds.actions.register('presentation-actions', [
  ds.action({
    name:    'open-in-graphite',
    display: 'Open in Graphite...',
    icon:    'fa fa-bar-chart-o',
    handler: function(action, item) {
      var composer_url = ds.charts.graphite.composer_url(item, { showTitle: true })
      window.open(composer_url.href())
    }
  }),
  ds.action({
    name:    'export-png',
    display: 'Export PNG...',
    icon:    'fa fa-file-image-o',
    handler: function(action, item) {
      var plot    = item.plot
      var options = plot.getOptions()
      var canvas  = plot.getCanvas()
      /**
       * In order to avoid obscuring part of the chart with the
       * legend, we're going to render the legend into a separate
       * Canvas, then paste the plot and legend together with a third
       * Canvas.
       */
      var canvas_legend    = $('<canvas width="' + canvas.width + '" height="96"/>')[0]
      var canvas_composite = $('<canvas width="' + canvas.width + '" height="' + (canvas.height + canvas_legend.height) + '"/>')[0]

      $.extend(true, options, {
        canvas: true,
        legend: { show: false },
        canvasLegend: {
          show: true,
          entrySize:   $.plot.canvasLegend.renderersAndSizers.boxLeftLabelRight.size,
          entryRender: $.plot.canvasLegend.renderersAndSizers.boxLeftLabelRight.render,
          container:   $(canvas_legend),
          layout:      $.plot.canvasLegend.layouts.tableWithNColumns(6)
        }
      })

      plot.setupGrid()
      plot.draw()

      var plot_image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
      var legend_image = canvas_legend.getContext('2d').getImageData(0, 0, canvas_legend.width, canvas_legend.height)
      canvas_composite.getContext('2d').drawImage(canvas, 0, 0)
      canvas_composite.getContext('2d').drawImage(canvas_legend, 0, canvas.height)

      window.open(canvas_composite.toDataURL())

      $.extend(true, options, {
        canvas: false,
        canvasLegend: { show: false }
      })

      plot.setupGrid()
      plot.draw()
    }
  }),
  ds.action({
    name:    'export-png-graphite',
    display: 'Export PNG from Graphite...',
    icon:    'fa fa-file-image-o',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true })
      window.open(image_url.href())
    }
  }),
  ds.action({
    name:    'export-svg-graphite',
    display: 'Export SVG from Graphite...',
    icon:    'fa fa-file-code-o',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true, format: 'svg' })
      window.open(image_url.href())
    }
  }),
  ds.action({
    name:    'export-csv',
    display: 'Export CSV...',
    icon:    'fa fa-file-excel-o',
    handler: function(action, item) {
      var image_url = ds.charts.graphite.chart_url(item, { showTitle: true, format: 'csv' })
      window.open(image_url.href())
    }
  })
])

$(document).on('click', 'ul.ds-action-menu li', function(event) {

  var presentation_id = $(this).parent().parent().parent().parent().parent()[0].id
  var item = ds.manager.current.dashboard.get_item(presentation_id)

  var action = ds.actions.get(this.getAttribute('data-ds-category'), this.getAttribute('data-ds-action'))
  action.handler(action, item)

  /* prevents resetting scroll position */
  return false
})
