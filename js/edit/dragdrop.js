/* -----------------------------------------------------------------------------
   Drag & Drop
   ----------------------------------------------------------------------------- */

ds.app.add_mode_handler(ds.app.Mode.EDIT, {

  enter: function() {

    var container = $('#dashboard')

    /* Drag ------------------------------ */

    /*
     * Containment rules:
     *   Drag Item         Allowable Targets
     *   ---------         -----------------
     *   presentation   -> cell
     *   cell           -> row
     *   row            -> section or cell
     *   section        -> section or dashboard
     *   markdown, header, separator ->  section or cell
     */
    function drag_options(item) {
      var target = '.ds-model'
      if (item.item_type === 'cell') {
        target = '.ds-row'
      } else if (item.item_type === 'row'
               || item.item_type === 'header'
               || item.item_type === 'separator'
               || item.item_type === 'markdown') {
        target = '.ds-cell, .ds-section'
      } else if (item.item_type === 'section') {
        target = '.ds-section, .ds-dashboard'
      } else {
        target = '.ds-cell'
      }

      return {
        drop: target
      }
    }

    /*
     * Drag start - create a proxy, so we're not messing up all the
     * layout by dragging the original elements.
     */
    function drag_start(ev, dd) {
      var parent = $(dd.target).parents('.ds-model')
      if (!parent)
        return null

      var item_id = parent.attr('id')
      var item    = ds.manager.current.dashboard.get_item(item_id)

      /* Constrain the drag to the dashboard container */
      dd.limit        = container.offset()
      dd.limit.bottom = dd.limit.top + container.outerHeight() - $(this).outerHeight()
      dd.limit.right  = dd.limit.left + container.outerWidth() - $(this).outerWidth()

      var proxy = $('<div class="ds-drag-proxy"/>')
                    .css({
                      width:  parent.width(),
                      height: parent.height()
                    }).appendTo(document.body)
      proxy[0].item = item

      $(dd.target).drag(drag, drag_options(item))

      return proxy
    }

    function drag_end(ev, dd) {
      $(dd.proxy).remove()
    }

    function drag(ev, dd) {
      $(dd.proxy).css({
        top:  Math.min(dd.limit.bottom, Math.max(dd.limit.top,  dd.offsetY)),
        left: Math.min(dd.limit.right,  Math.max(dd.limit.left, dd.offsetX))
      })
    }


    $('.ds-edit-bar').drag('start', drag_start, {not: '.badge'})
                     .drag('end', drag_end)

    /* Drop ------------------------------ */

    function drop_start(ev, dd) {
      var target       = $(this)
      var dragged_item = dd.proxy.item
      var target_item  = ds.manager.current.dashboard.get_item(target.attr('id'))

      $(this).addClass('ds-drop-active')
    }

    function drop_end(ev, dd) {
      var target       = $(this)
      var dragged_item = dd.proxy.item
      var target_item  = ds.manager.current.dashboard.get_item(target.attr('id'))

      $(this).removeClass('ds-drop-active')
    }

    function drop(ev, dd) {
      console.log('drop')
      console.log(ev.target)
      console.log(dd.target)
      console.log(dd.proxy)
    }

    $.drop({
      mode: 'overlap'
    })

    /* Drop handlers - have to bind these from most nested to least */
    $('.ds-cell').drop('start', drop_start)
                 .drop('end', drop_end)
                 .drop(drop)
    $('.ds-row').drop('start', drop_start)
                .drop('end', drop_end)
                .drop(drop)
    $('.ds-section').drop('start', drop_start)
                    .drop('end', drop_end)
                    .drop(drop)
    $('.ds-dashboard').drop('start', drop_start)
                      .drop('end', drop_end)
                      .drop(drop)

  },

  exit: function() {
    // TODO - remove drag handlers
  }
})
