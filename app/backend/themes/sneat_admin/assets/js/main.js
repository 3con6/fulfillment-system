/**
 * Main
 */

'use strict';

let menu, animate;

(function () {
    // Initialize menu
    //-----------------

    let layoutMenuEl = document.querySelectorAll('#layout-menu');
    layoutMenuEl.forEach(function (element) {
        menu = new Menu(element, {
            orientation: 'vertical',
            closeChildren: false
        });
        // Change parameter to true if you want scroll animation
        window.Helpers.scrollToActive((animate = false));
        window.Helpers.mainMenu = menu;
    });

    // Initialize menu togglers and bind click on each
    let menuToggler = document.querySelectorAll('.layout-menu-toggle');
    menuToggler.forEach(item => {
        item.addEventListener('click', event => {
            event.preventDefault();
            window.Helpers.toggleCollapsed();
        });
    });

    // Display menu toggle (layout-menu-toggle) on hover with delay
    let delay = function (elem, callback) {
        let timeout = null;
        elem.onmouseenter = function () {
            // Set timeout to be a timer which will invoke callback after 300ms (not for small screen)
            if (!Helpers.isSmallScreen()) {
                timeout = setTimeout(callback, 300);
            } else {
                timeout = setTimeout(callback, 0);
            }
        };

        elem.onmouseleave = function () {
            // Clear any timers set to timeout
            document.querySelector('.layout-menu-toggle').classList.remove('d-block');
            clearTimeout(timeout);
        };
    };
    if (document.getElementById('layout-menu')) {
        delay(document.getElementById('layout-menu'), function () {
            // not for small screen
            if (!Helpers.isSmallScreen()) {
                document.querySelector('.layout-menu-toggle').classList.add('d-block');
            }
        });
    }

    // Display in main menu when menu scrolls
    let menuInnerContainer = document.getElementsByClassName('menu-inner'),
        menuInnerShadow = document.getElementsByClassName('menu-inner-shadow')[0];
    if (menuInnerContainer.length > 0 && menuInnerShadow) {
        menuInnerContainer[0].addEventListener('ps-scroll-y', function () {
            if (this.querySelector('.ps__thumb-y').offsetTop) {
                menuInnerShadow.style.display = 'block';
            } else {
                menuInnerShadow.style.display = 'none';
            }
        });
    }

    // Init helpers & misc
    // --------------------

    // Init BS Tooltip
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Accordion active class
    const accordionActiveFunction = function (e) {
        if (e.type == 'show.bs.collapse' || e.type == 'show.bs.collapse') {
            e.target.closest('.accordion-item').classList.add('active');
        } else {
            e.target.closest('.accordion-item').classList.remove('active');
        }
    };

    const accordionTriggerList = [].slice.call(document.querySelectorAll('.accordion'));
    const accordionList = accordionTriggerList.map(function (accordionTriggerEl) {
        accordionTriggerEl.addEventListener('show.bs.collapse', accordionActiveFunction);
        accordionTriggerEl.addEventListener('hide.bs.collapse', accordionActiveFunction);
    });

    // Auto update layout based on screen size
    window.Helpers.setAutoUpdate(true);

    // Toggle Password Visibility
    window.Helpers.initPasswordToggle();

    // Speech To Text
    window.Helpers.initSpeechToText();

    // Manage menu expanded/collapsed with templateCustomizer & local storage
    //------------------------------------------------------------------

    // If current layout is horizontal OR current window screen is small (overlay menu) than return from here
    if (window.Helpers.isSmallScreen()) {
        return;
    }

    // If current layout is vertical and current window screen is > small

    // Auto update menu collapsed/expanded based on the themeConfig
    window.Helpers.setCollapsed(true, false);
})();

var t, n, e, o = $(".search-toggler"), s = $(".search-input-wrapper"), a = $(".input-search"), l = $(".content-backdrop");
o.length && o.on("click", function () {
    s.length && (s.toggleClass("d-none"),
        a.focus())
});
$(document).on("keydown", function (e) {
    var t = e.ctrlKey
        , e = 191 === e.which;
    t && e && s.length && (s.toggleClass("d-none"),
        a.focus())
})

"use strict";
$(function () {
    var start = moment().subtract(30, 'days');
    var end = moment();

    function cb(start, end) {
        $('#date-range-picker').val(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'));
    }
    function cb2(start, end) {
        $('#date-range-picker-2').val(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'));
    }
    function cb3(start, end) {
        $('#date-range-picker-3').val(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'));
    }

    $('#date-range-picker').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        alwaysShowCalendars: true,
        opens: 'left',
        showCustomRangeLabel: false,
        autoUpdateInput: false,
        locale: {
            format: 'YYYY/MM/DD'
        }
    }, cb);

    $('#date-range-picker-2').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        alwaysShowCalendars: true,
        opens: 'left',
        showCustomRangeLabel: false,
        autoUpdateInput: false,
        locale: {
            format: 'YYYY/MM/DD'
        }
    }, cb);

    $('#date-range-picker-3').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        alwaysShowCalendars: true,
        opens: 'left',
        showCustomRangeLabel: false,
        autoUpdateInput: false,
        locale: {
            format: 'YYYY/MM/DD'
        }
    }, cb3);

    cb(start, end);
    cb2(start, end);
    cb3(start, end);


    $('#date-range-picker').on('apply.daterangepicker', function (ev, picker) {
        var search = $('#search').val();
        var startDate = picker.startDate.format('YYYY/MM/DD');
        var endDate = picker.endDate.format('YYYY/MM/DD');
        $('.product-chart').hide();
        $('.product-chart').html('');
        $('.loading_spinner').show();

        $.ajax({
            url: '/api/products',
            method: 'POST',
            data: JSON.stringify({
                start: startDate,
                end: endDate,
                search: search
            }),
            success: function (response) {
                $('.card-body').html(response.html);
                // $('.product-chart').show();
                $('.loading_spinner').hide();
                console.log(response);
            },
            error: function (error) {
                $('.loading_spinner').hide();
                $('.product-chart').html(error.responseText);
                $('.product-chart').show();
                console.log(error);
            }
        });

        $(this).val(startDate + ' - ' + endDate);
    });


    $('#date-range-picker').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
    });

    $('#date-range-picker-2').on('apply.daterangepicker', function (ev, picker) {
        var startDate = picker.startDate.format('YYYY/MM/DD');
        var endDate = picker.endDate.format('YYYY/MM/DD');

        $(this).val(startDate + ' - ' + endDate);
    });


    $('#date-range-picker-2').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
    });

});

