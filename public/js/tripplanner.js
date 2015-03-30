$(document).ready(function() {

    var map;
    initialize_gmaps();

    var days = [[]];
    var currentDay = 1;
    var itineraryItems = [];

    $('.add-button').on('click', function() {
        var $button = $(this);
        var item = getItemInfo($button);
        var itemIsDuplicate = checkIfDuplicate(item);

        if (itemIsDuplicate) return;

        item.marker = addItemMarkerToMap(item);

        addItemToItinerary(item);
        itineraryItems.push(item);

        setMapBounds();
    });

    $('.chosen-list').on('click', '.remove-button', function() {
        var $button = $(this);

        removeItemMarkerFromMap($button);
        removeItineraryItem($button);

        setMapBounds();
    });

    $('#add-day-button').on('click', function() {
        var $button = $(this);

        addNewDay($button);
        $button.prev().trigger('click');
    });

    $('#day-buttons').on('click', '.select-day', function() {
        var $button = $(this);

        switchDay($button);

        setMapBounds();
    });

    $('#remove-day-button').on('click', function() {
        var numberOfDays = $('#add-day-button').siblings().length;
        if (currentDay === 1 && numberOfDays === 1) return;

        removeDayItineraryAndMarkers();

        days.splice(currentDay - 1, 1);

        removeDayButton();
        renumberDayButtons();
        loadDayItineraryAndMarkers();

        setMapBounds();
    });


    function getItemInfo($button) {
        var itemType = $button.parent('div').attr('id').split('-')[0];
        var itemText = $button.siblings('select').val();

        return {
            type: itemType,
            text: itemText
        };
    }

    function addItemToItinerary(item, switching) {
        var itineraryListId = getItineraryListId(item.type);
        var $chosenList = $(itineraryListId).children('.chosen-list');

        if (!switching) {
            if (item.type === 'hotel') {
                $chosenList.empty();
                itineraryItems = itineraryItems.filter(function(itineraryItem) {
                    return itineraryItem.type !== 'hotel';
                });
            }
            if (item.type === 'restaurant' && $chosenList.children().length === 3) return;
        }

        var itemHtml = createItemHtml(item);
        $chosenList.append(itemHtml);
    }

    function addItemMarkerToMap(item) {
        var itineraryListId = getItineraryListId(item.type);
        var $chosenList = $(itineraryListId).children('.chosen-list');
        var itemLocation = getItemLocation(item);
        var icon = matchTypeToIcon(item.type);

        var currentHotel = itineraryItems.filter(function(itineraryItem) {
            return itineraryItem.type === 'hotel';
        })[0];

        if (item.type === 'hotel' && currentHotel) {
            currentHotel.marker.setMap(null);
        }

        if (item.type === 'restaurant' && $chosenList.children().length === 3) return;

        var marker = drawLocation(itemLocation, { icon: icon });
        return marker;
    }

    function getItemLocation(item) {
        var collection;
        switch(item.type) {
            case 'hotel':
                collection = all_hotels;
                break;
            case 'restaurant':
                collection = all_restaurants;
                break;
            case 'activity':
                collection = all_things_to_do;
                break;
        }

        var itemInCollection = collection.filter(function(collectionItem) {
            return collectionItem.name === item.text;
        })[0];

        return itemInCollection.place[0].location;
    }

    function matchTypeToIcon(type) {
        switch(type) {
            case 'hotel':
                return '/images/hotel.png';
            case 'restaurant':
                return '/images/restaurant.png';
            case 'activity':
                return '/images/thingToDo.png';
        }
    }

    function checkIfDuplicate(item) {
        var itineraryListId = getItineraryListId(item.type);
        var isDuplicate = false;

        $(itineraryListId).find('li').each(function() {
            if ($(this).text() === item.text) isDuplicate = true;
        });

        return isDuplicate;
    }

    function getItineraryListId(type) {
        return '#' + type + '-itinerary';
    }

    function createItemHtml(item) {
        return '<li class="itinerary-item"><span class="choice-title">' +
                item.text +
                '</span><button class="btn pull-right remove-button"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></li>';
    }

    function removeItemMarkerFromMap($button) {
        var itemMarker = getItineraryItemMarker($button);
        itemMarker.setMap(null);
    }

    function getItineraryItemMarker($button) {
        var itemText = $button.siblings('span').text();
        var itemMarker = itineraryItems.filter(function(itineraryItem) {
            return itineraryItem.text === itemText;
        })[0].marker;

        return itemMarker;
    }

    function removeItineraryItem($button) {
        var itemText = $button.siblings('span').text();

        $button.parent().remove();
        itineraryItems = itineraryItems.filter(function(itineraryItem) {
            return itineraryItem.text !== itemText;
        });
    }

    function addNewDay($button) {
        var newDayNum = $button.siblings().length + 1;
        var newButtonHtml = createDayButtonHtml(newDayNum);
        $button.before(newButtonHtml);
        days[newDayNum - 1] = [];
    }

    function createDayButtonHtml(newDayNum) {
        return '<button class="btn day-btn select-day">' + newDayNum + '</button>';
    }

    function switchDay($button) {
        // Switch current-day class on day-buttons
        $('.current-day').removeClass('current-day');
        $button.addClass('current-day');

        // Save day's itinerary, then remove items from control-panel
        days[currentDay - 1] = itineraryItems;
        removeDayItineraryAndMarkers();

        // Set the new currentDay and change #day-name in control-panel
        currentDay = $('.current-day').index() + 1;
        $('#day-name').text('Day ' + currentDay);

        // Retrieve new currentDay's itineraryItems and load into control-panel and map
        itineraryItems = days[currentDay - 1];
        loadDayItineraryAndMarkers();
    }

    function removeDayItineraryAndMarkers() {
        $('#itinerary-panel').find('.chosen-list').empty();

        itineraryItems.forEach(function(item) {
            item.marker.setMap(null);
        });
    }

    function loadDayItineraryAndMarkers() {
        itineraryItems = days[currentDay - 1];

        itineraryItems.forEach(function(item) {
            item.marker.setMap(map);
            addItemToItinerary(item, true);
        });
    }

    function removeDayButton() {
        $('.current-day').addClass('DELETE');
        var lastDay = Number($('#add-day-button').prev().text());

        if (currentDay === lastDay) {
            $('.current-day').prev().addClass('current-day');
            currentDay--;
            $('#day-name').text('Day ' + currentDay);
        }
        else $('.current-day').next().addClass('current-day');

        $('.DELETE').remove();
    }

    function renumberDayButtons() {
        $('#add-day-button').siblings().each(function() {
            var dayNum = $(this).index() + 1;
            $(this).text(dayNum);
        });
    }

    function setMapBounds() {

        if (itineraryItems.length === 0) return initialize_gmaps();

        var bounds = new google.maps.LatLngBounds();

        itineraryItems.forEach(function(itineraryItem) {
            bounds.extend(itineraryItem.marker.position);
        });

        map.fitBounds(bounds);
    }

    function drawLocation(location, opts) {
        if (typeof opts !== 'object') opts = {};
        opts.position = new google.maps.LatLng(location[0], location[1]);
        opts.map = map;
        var marker = new google.maps.Marker(opts);
        return marker;
    }

    function initialize_gmaps() {
        var styleArr = [
            {
                'featureType': 'landscape',
                'stylers': [
                { 'saturation': -100 },
                { 'lightness': 60 }
            ]
            },
            {
                'featureType': 'road.local',
                'stylers': [
                { 'saturation': -100 },
                { 'lightness': 40 },
                { 'visibility': 'on' }
                ]
            },
            {
                'featureType': 'transit',
                'stylers': [
                { 'saturation': -100 },
                { 'visibility': 'simplified' }
                ]
            },
            {
                'featureType': 'administrative.province',
                'stylers': [
                { 'visibility': 'off' }
                ]
            },
            {
                'featureType': 'water',
                'stylers': [
                { 'visibility': 'on' },
                { 'lightness': 30 }
                ]
            },
            {
                'featureType': 'road.highway',
                'elementType': 'geometry.fill',
                'stylers': [
                { 'color': '#ef8c25' },
                { 'lightness': 40 }
                ]
            },
            {
                'featureType': 'road.highway',
                'elementType': 'geometry.stroke',
                'stylers': [
                { 'visibility': 'off' }
                ]
            },
            {
                'featureType': 'poi.park',
                'elementType': 'geometry.fill',
                'stylers': [
                { 'color': '#b6c54c' },
                { 'lightness': 40 },
                { 'saturation': -40 }
                ]
            }
        ];
        // initialize new google maps LatLng object
        var myLatlng = new google.maps.LatLng(40.705189,-74.009209);
        // set the map options hash
        var mapOptions = {
            center: myLatlng,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: styleArr
        };
        // get the maps div's HTML obj
        var map_canvas_obj = document.getElementById("map-canvas");
        // initialize a new Google Map with the options
        map = new google.maps.Map(map_canvas_obj, mapOptions);
        // Add the marker to the map
        var marker = new google.maps.Marker({
            position: myLatlng,
            title:"Hello World!"
        });
    }
});