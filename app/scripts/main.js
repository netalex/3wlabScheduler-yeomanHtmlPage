// app.js
$(function() {


    var baseMaxEventId = 1000;

    var baseUrl = 'https://tre-wlab-scheduler.herokuapp.com';

    var viewsObj = {
        timelineThreeDays: {
            type: 'timeline',
            duration: {
                days: 3
            }
        },
        timelineFiveDays: {
            type: 'timeline',
            duration: {
                days: 5
            }
        },
        timeline31Days: {
            type: 'timeline',
            duration: {
                days: 31
            }
        }
    };

    var businessHoursObj = [{
            dow: [1, 2, 3, 4, 5], // Monday - Thursday
            start: '9:00',
            end: '13:00'
        }, {
            dow: [1, 2, 3, 4, 5],
            start: '14:00',
            end: '18:00'
        }];

    var headerObj = {
            left: 'today prev,next',
            center: 'title',
            right: 'timelineDay,timelineThreeDays,timelineFiveDays,timeline31Days,agendaWeek,month'
        };

    var updateServer = function(eventUpdated) {
        $.ajax({
                url: baseUrl + '/events/' + eventUpdated.id,
                type: 'PUT',
                dataType: 'json',
                data: eventUpdated
            })
            .done(function(response) {
                console.log('updateServer success');
                console.log(response);
            })
            .fail(function() {
                console.log('updateServer error');
                console.log(xhr);
            })
            .always(function() {
                console.log('updateServer complete');
            });
    };

    var deleteEventFromServer = function(eventDeleted) {
        $.ajax({
                url: baseUrl + '/events/' + eventDeleted.id,
                type: 'DELETE',
            })
            .done(function() {
                console.log('deleteEventFromServer success:');
                console.log('event' + eventDeleted.id + ', title ' + eventDeleted.title + ' deleted from server');
            })
            .fail(function() {
                console.log('deleteEventFromServer error:');
                console.log('event' + eventDeleted.id + ', title ' + eventDeleted.title + ' deletion from server failed');
            })
            .always(function() {
                console.log('deleteEventFromServer complete');
            });
    };

    var getConfig = function() {
        $.ajax({
                url: baseUrl + '/config/1',
                type: 'GET',
                dataType: 'json',
            })
            .done(function(configData) {
                console.log('config success');
                baseMaxEventId = configData.baseMaxEventId;
                console.log('baseMaxEventId: ' + baseMaxEventId);
            })
            .fail(function() {
                console.log('config error');
                console.log(xhr);
            })
            .always(function() {
                console.log('config complete');
            });
    };

    var postConfig = function(data) {
        $.ajax({
                url: baseUrl + '/config/1',
                type: 'PUT',
                dataType: 'json',
                data: data,
            })
            .done(function() {
                console.log('postConfig success');
            })
            .fail(function() {
                console.log('postConfig error');
            })
            .always(function() {
                console.log('postConfig complete');
            });
    };

    var resourcesGetObj = {
        url: baseUrl + '/resources',
        type: 'GET',
        error: function() {
            $('#script-warning').show();
        }
    };

    var eventsPostObj = function(data) {
        $.ajax({
                url: baseUrl + '/events',
                type: 'POST',
                dataType: 'json',
                data: data,
            })
            .done(function() {
                console.log('eventsPostObj success');
            })
            .fail(function() {
                console.log('eventsPostObj error');
            })
            .always(function() {
                console.log('eventsPostObj complete');
            });
    };

    var eventDropFunction = function(eventData, delta, revertFunc) {
        alert(eventData.title + ' was dropped on ' + eventData.start.format());
        if (!confirm('Are you sure about this change?')) {
            revertFunc();
        } else {
            $('#calendar').fullCalendar('updateEvent', eventData);
            var eventUpdated = {
                id: eventData.id,
                resourceId: eventData.resourceId,
                start: eventData.start.unix(),
                end: eventData.end.unix(),
                title: eventData.title
            };
            updateServer(eventUpdated);
        }
    };

    var eventResizeStopFunction = function(eventData, jsEvent, ui, view) {
        alert(eventData.title + ' was resized to ' + eventData.end.format());
        if (!confirm('Are you sure about this change?')) {
            revertFunc();
        } else {
            $('#calendar').fullCalendar('updateEvent', eventData);
            var eventUpdated = {
                id: eventData.id,
                resourceId: eventData.resourceId,
                start: eventData.start.unix(),
                end: eventData.end.unix(),
                title: eventData.title
            };
            updateServer(eventUpdated);
        }
    };

    var selectFunction = function(start, end, jsEvent, view, resource) {
        var title = prompt('Event Title:');
        var selectedEventData = {};
        var selectedEventDataRendered = {};
        if (title) {
            selectedEventData = {
                id: JSON.parse(baseMaxEventId) + 10,
                resourceId: resource.id,
                start: start.unix(),
                end: end.unix(),
                title: title
            };
            selectedEventDataRendered = {
                id: JSON.parse(baseMaxEventId) + 10,
                resourceId: resource.id,
                start: start,
                end: end,
                title: title
            };
            console.dir(selectedEventData);
            console.dir(selectedEventDataRendered);
            baseMaxEventId = JSON.parse(selectedEventData.id) + 1;
            eventsPostObj(selectedEventData);
            var baseMaxEventIdObj = {
                'id': '1',
                'baseMaxEventId': baseMaxEventId
            };
            postConfig(baseMaxEventIdObj);
            $('#calendar').fullCalendar('renderEvent', selectedEventDataRendered, true); // stick? = true
            console.log('post renderEvent nuovo');
            // $('#calendar').fullCalendar('getResources');
            $('#calendar').fullCalendar('rerenderEvents');
            console.log('post renderEvents refresh');
        }
        $('#calendar').fullCalendar('unselect');
    };

    var eventClickFunction = function(event, jsEvent, view) {
        if (confirm('Delete this event??')) {
            deleteEventFromServer(event);
            $('#calendar').fullCalendar('removeEvents', event.id);
        }
    };

    getConfig();


    // fulcalendar chiamata principale
/*----------------------------------------------------------------------------*/

    $('#calendar').fullCalendar({
        //local configuration section
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
        locale: 'it',
        weekends: false,
        businessHours: businessHoursObj,
        minTime: '09:00:00',
        maxTime: '18:00:00',
        now: moment(),
        navLinks: true,
        editable: true,
        selectable: true,
        selectHelper: true,
        aspectRatio: 3,
        height: $(window).height() * 0.92,
        header: headerObj,
        defaultView: 'timeline31Days',
        views: viewsObj,
        resourceLabelText: 'Risorse',
        //downloads events and resources
        resources: resourcesGetObj,
        events: function(start, end, timezone, callback) {
            $.ajax({
                url: baseUrl + '/events',
                type: 'GET',
                dataType: 'json',
                data: {
                    start: start.unix(),
                    end: end.unix()
                },
                success: function(data) {
                    var events = [];
                    $(data).each(function() {
                        events.push({
                            id: $(this).attr('id'),
                            resourceId: $(this).attr('resourceId'),
                            resourceIds: $(this).attr('resourceIds'),
                            start: moment.unix($(this).attr('start')).format('YYYY-MM-DDTHH:mm:ss'),
                            end: moment.unix($(this).attr('end')).format('YYYY-MM-DDTHH:mm:ss'),
                            title: $(this).attr('title')
                        });
                    });
                    callback(events);
                    console.log('eventsGetFunction success');
                },
                error: function() {
                    $('#script-warning').show();
                    console.log('eventsGetFunction error');
                }
            });
        },
        eventRender: function(eventData, element) {
            console.log('eventRenderFunction on,\n\r event: ' + eventData.title + ' ' + eventData.id);
            element.css('font-weight:bold');
            console.log('eventRenderFunction off');
        },
        eventDrop: function(eventData, delta, revertFunc) {
            eventDropFunction(eventData, delta, revertFunc);
        },
        eventResizeStop: function(eventData, jsEvent, ui, view) {
            eventResizeStopFunction(eventData, jsEvent, ui, view);
        },
        select: function(start, end, jsEvent, view, resource) {
            selectFunction(start, end, jsEvent, view, resource);
        },
        eventClick: function(event, jsEvent, view) {
            eventClickFunction(event, jsEvent, view);
        }
    });

});
