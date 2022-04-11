// ==UserScript==
// @name         Pass für alle
// @namespace    https://passfuralle.se
// @version      2.10
// @description  Ett snabbt och enkelt sätt att boka passtid
// @author       Jonk
// @match        https://bokapass.nemoq.se/Booking/Booking/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js#sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=
// @require      https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/js/ion.sound.min.js

// ==/UserScript==

(function($) {

    // Constants
    log('Set constants');
    var dateFrom = today();
    var dateTo = '2022-12-24';
    var autoConfirm = true;

    var datePickerElem = $('#datepicker');
    if (!localStorage.getItem('TimeSearch')) {
        log('Set start date');
        datePickerElem.val(dateFrom);
    }

    $('input[name="TimeSearchButton"]').on('click', function () {
        log('Start time search');
        localStorage.setItem('TimeSearch', 'TimeSearchButton');
        localStorage.removeItem('responseText');
    });
    $('input[name="TimeSearchFirstAvailableButton"]').on('click', function () {
        log('Start time search first available');
        localStorage.setItem('TimeSearch', 'TimeSearchFirstAvailableButton');
        localStorage.removeItem('responseText');
    });
    $('a[href*="/Booking/Booking/Previous/skane?id="]').on('click', function() {
        log('Clear time search');
        localStorage.removeItem('TimeSearch');
        localStorage.removeItem('responseText');
    });

    setButtonTexts();
    $("#SectionId").change(function() {
        setButtonTexts();
    });

    // Find a time
    if ($('.controls .btn.btn-primary[name="TimeSearchButton"]').length || $('.controls .btn.btn-primary[name="TimeSearchFirstAvailableButton"]').length) {
        log('Time search view');

        var datePickerVal = datePickerElem.val();

        if (Date.parse(datePickerVal) < Date.parse(dateFrom)) {
            log('Start later than today');
            datePickerElem.val(dateFrom);
        }

        if (localStorage.getItem('TimeSearch')) {
            log('Start time search');
            if (Date.parse(datePickerVal) > Date.parse(dateTo) || (localStorage.getItem('TimeSearch') == 'TimeSearchButton' && Date.parse(datePickerVal) < Date.parse(dateFrom))) {
                log('Start over time search');
                datePickerElem.val(dateFrom);
                setTimeout(function () {
                    $('input[name="' + localStorage.getItem('TimeSearch') + '"]').click();
                }, timeSearchTimeout());
            } else {
                log('Check for slot');
                let availableTimeSlots = $('.pointer.timecell.text-center[data-function="timeTableCell"][style*="#1862a8"]');
                if (availableTimeSlots.length) {
                    log('Time found');
                    availableTimeSlots.first().click();
                    let timeSelectionText;
                    if ($.trim($('#timeSelectionText').text()).length) {
                        timeSelectionText = $('#timeSelectionText').text();
                    } else {
                        timeSelectionText = availableTimeSlots.first().data('fromdatetime');
                    }
                    var responseText = $.trim($('#selectionText').text() + ' ' + $('#sectionSelectionText').text() + ' ' + timeSelectionText);
                    localStorage.setItem('responseText', responseText);
                    if (autoConfirm || confirm(responseText)) {
                        log('Auto confirm');
                        $('#booking-next').click();
                    }
                } else {
                    log('No time found');
                    setTimeout(function () {
                        log('Check next');
                        if ($('#nextweek').length) {
                            log('Check next week');
                            $('#nextweek').attr('name','TimeSearchButton');
                            $('#nextweek').click();
                        } else if ($('.btn.btn-link.pull-right').attr('name','KeyTimeSearchNextDayButton').length) {
                            log('Check next day');
                            $('.btn.btn-link.pull-right').attr('name','KeyTimeSearchNextDayButton').click();
                        }
                    }, timeSearchTimeout());
                }
            }
        }
    }

    // Time found
    if ($('#Customers_0__BookingFieldValues_0__Value').length) {
        log('Book time view');
        $('#Customers_0__BookingFieldValues_0__Value').closest('.control-group').before('<h2 style="text-align:center">' + localStorage.getItem('responseText') + '</h2>');
        localStorage.removeItem('TimeSearch');
        localStorage.removeItem('responseText');
        playSuccessSound();
    }

    function log(log) {
        console.log(log);
    }

    function timeSearchTimeout() {
        log('Set timeout');
        var timeout = 1000;
        //if ($('.validation-summary-errors.alert.alert-error').length) {
        if (localStorage.getItem('TimeSearch') == 'TimeSearchFirstAvailableButton') {
            log('Long timeout');
            timeout = 15000;
        } else {
            log('Normal timeout');
        }
        return timeout;
    }

    function today() {
        var today = new Date();
        /*
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        return yyyy + '-' + mm + '-' + dd;
        */
        return today.toISOString().slice(0,10);
    }

    function setButtonTexts() {
        log('Set button texts');
        $('input[name="TimeSearchFirstAvailableButton"]').val('Första lediga tid innan ' + dateTo);
        if ($("#SectionId option:selected").val() == 0) {
            $('input[name="TimeSearchButton"]').val('Sök tid mellan ' + dateFrom + ' och ' + dateTo);
        } else {
            $('input[name="TimeSearchButton"]').val('Funkar inte än');
        }
    }

    function playSuccessSound() {
        ion.sound({
            sounds: [
                {name: "bell_ring"}
            ],

            // main config
            path: "https://cdnjs.cloudflare.com/ajax/libs/ion-sound/3.0.7/sounds/",
            preload: true,
            multiplay: true,
            volume: 0.9
        });

        // play sound
        ion.sound.play("bell_ring");
    }

})(jQuery);
