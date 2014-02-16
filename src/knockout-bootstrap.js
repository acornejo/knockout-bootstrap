(function () {
  function factory(ko, $) {
    // Bind twitter typeahead
    ko.bindingHandlers.typeahead = {
      init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $element = $(element);
        var allBindings = allBindingsAccessor();
        var typeaheadOpts = { source: ko.utils.unwrapObservable(valueAccessor()) };

        if (allBindings.typeaheadOptions) {
          $.each(allBindings.typeaheadOptions, function(optionName, optionValue) {
            typeaheadOpts[optionName] = ko.utils.unwrapObservable(optionValue);
          });
        }

        $element.attr("autocomplete", "off").typeahead(typeaheadOpts);
      }
    };

    // Bind Twitter Progress
    ko.bindingHandlers.progress = {
      init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $element = $(element);

        var bar = $('<div/>', {
          'class': 'bar',
          'data-bind': 'style: { width:' + valueAccessor() + ' }'
        });

        $element.addClass('progress progress-info').append(bar);

        ko.applyBindingsToDescendants(viewModel, $element[0]);
      }
    };

    // Bind Twitter Alert
    ko.bindingHandlers.alert = {
      init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $element = $(element);
        var alertInfo = ko.utils.unwrapObservable(valueAccessor());

        var dismissBtn = $('<button/>', {
          'type': 'button',
          'class': 'close',
          'data-dismiss': 'alert'
        }).html('&times;');

        var alertMessage = $('<p/>').html(alertInfo.message);

        $element.addClass('alert alert-' + alertInfo.priority)
        .append(dismissBtn)
        .append(alertMessage);
      }
    };

    // Bind Twitter Tooltip
    ko.bindingHandlers.tooltip = {
      update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $element = $(element),
          options = ko.utils.unwrapObservable(valueAccessor()),
          tooltip;

        // If the title is an observable, make it auto-updating.
        if (ko.isObservable(options.title)) {
          var isToolTipVisible = false;

          $element.on('show.bs.tooltip', function () {
            isToolTipVisible = true;
          });
          $element.on('hide.bs.tooltip', function () {
            isToolTipVisible = false;
          });

          // "true" is the bootstrap default.
          var origAnimation = options.animation || true;
          options.title.subscribe(function () {
            if (isToolTipVisible) {
              $element.data('bs.tooltip').options.animation = false; // temporarily disable animation to avoid flickering of the tooltip
              $element.tooltip('fixTitle') // call this method to update the title
              .tooltip('show');
              $element.data('bs.tooltip').options.animation = origAnimation;
            }
          });
        }

        tooltip = $element.data('bs.tooltip');
        if (tooltip) {
          $.extend(tooltip.options, options);
        } else {
          $element.tooltip(options);
        }
      }
    };

    // Bind Twitter Popover
    ko.bindingHandlers.popover = {
      init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // read popover options
        var popoverBindingValues = ko.utils.unwrapObservable(valueAccessor());

        // set popover title
        var popoverTitle = popoverBindingValues.title;

        // set popover trigger
        var trigger = popoverBindingValues.trigger || 'click';

        // update triggers
        if (trigger === 'hover') {
          trigger = 'mouseenter mouseleave';
        } else if (trigger === 'focus') {
          trigger = 'focus blur';
        }

        // setup container and knockout bindings
        var container = $('<div data-bind="template: popoverTemplate "/>');
        var containerBindings = bindingContext.extend({popoverTemplate: popoverBindingValues.template});
        ko.applyBindings(containerBindings, container[0]);

        // set popup options
        var options = {
          content: function () { return container; },
          title: popoverTitle
        };

        if (popoverBindingValues.placement)
          options.placement = popoverBindingValues.placement;

        if (popoverBindingValues.container)
          options.container = popoverBindingValues.container;

        // Need to copy this, otherwise all the popups end up with the value of the last item
        var popoverOptions = $.extend({}, ko.bindingHandlers.popover.options, options);

        // bind popover to element click
        $(element).bind(trigger, function () {
          var popoverAction = 'show';
          var popoverTriggerEl = $(this);

          // popovers that hover should be toggled on hover
          // not stay there on mouseout
          if (trigger !== 'click') {
            popoverAction = 'toggle';
          }

          // show/toggle popover
          popoverTriggerEl.popover(popoverOptions).popover(popoverAction);
          var popoverEl = container.parents('.popover');

          // // hide other popovers and bind knockout to the popover elements
          $('.popover').each(function (e) {
            if (!$.contains(e, container))
              $(e).remove();
          });

          // bind close button to remove popover
          popoverEl.on('click', '[data-dismiss="popover"]', function (e) {
            popoverTriggerEl.popover('hide');
          });
        });
      },
      options: {
        placement: "right",
        title: "",
        html: true,
        content: "",
        trigger: "manual"
      }
    };
  }

  if (typeof define === 'function' && define.amd) {
    define(["knockout", "jquery"], factory);
  } else {
    factory(window.ko, window.$);
  }

})();
