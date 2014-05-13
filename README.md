# openbus-api
a developer-friendly, open-source bus and transit api

Currently being developed with CARTA in Chattanooga, Tennessee, USA.


## Install

Openbus-API is a Node.js application. Get started by [installing Node](https://github.com/codeforamerica/howto/blob/master/Node.js.md) on your development environment, and then [use the included Procfile](https://github.com/codeforamerica/howto/blob/master/Procfile.md) to run.


## Unstable


~~There's a very good chance the JSON structure of the current endpoints will be changing to better support GeoJSON.~~
GeoJSON support has been implemented.
This API should currently be considered unstable. *Any apps you build off of it right now will probably break*

### Basic Usage:

#### `/buses`
is a static GeoJSON response with the latest information from
CARTA represented as a GeoJSON FeatureCollection. Unfortunately, there's no indication of a timestamp for when
information was last received from the bus. The buses which show up on
here should all be currently active, as far as I can tell from the data
source. Throughout the day, buses will be added and removed from this
list automatically.

Sample Output:
```
{
    features: [
        {
            geometry: {
                coordinates: [
                    -85.2699145,
                    35.05605216666667
                ],
                type: Point
            },
            id: 118,
            properties: {
                color: #FFFFFF,
                direction: North East Bound,
                heading: NNE,
                route: PI,
                routeDirection: N/A,
                stop: N/A
            },
            type: Feature
        }
        ],
    "type": "FeatureCollection"
}
```

 

#### `/buses/tail`
is a [server-sent events
stream](https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events#Event_stream_format)
with three types of events:

-   `add` when a bus is added. On first connection, all currently active
    buses are sent out as `add` events - similar to scrollback on
    reconnect for a chat client. This lets you do things immediately,
    such as draw the initial locations on a map.

-   `change` when any of the properties on a bus object are changed -
    this could be the lat/lon, the inbound/outbound segment on the
    route, etc.

-   `remove` when a bus goes out of service and information about that
    bus is no longer available from CARTA.

The body of the event is a GeoJSON Feature with information pertaining to an individual bus.

```
event: change
data:
{
    "geometry": {
        "coordinates": [
            -85.26986016666666, 
            35.05618
        ], 
        "type": "Point"
    }, 
    "id": "125", 
    "properties": {
        "color": "#FFFFFF", 
        "direction": "North East Bound", 
        "heading": "NNE", 
        "route": "PI", 
        "routeDirection": "N/A", 
        "stop": "N/A"
    }, 
    "type": "Feature"
}

```

Example usage from a web browser via the [EventSource](https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events) api:

```js
var busStream = new EventSource('http://api.chab.us/buses/tail')

busStream.addEventListener('add', function (e) {
    // EventSouurce returns data as a JSON string, we must parse it into an Object
    var bus = JSON.parse(e.data)
    console.log('bus added', bus)
})

busStream.addEventListener('change', function (e) {
    // EventSouurce returns data as a JSON string, we must parse it into an Object
    var bus = JSON.parse(e.data)
    console.log('bus changed', bus)
})

busStream.addEventListener('remove', function (e) {
    // EventSouurce returns data as a JSON string, we must parse it into an Object
    var bus = JSON.parse(e.data)
    console.log('bus removed', bus)
})
```

###Apps built so far include:

-   [https://github.com/acedrew/chab.us-maps](https://github.com/acedrew/chab.us-maps)
-   [https://github.com/jden/silly-little-bus-radar](https://github.com/jden/silly-little-bus-radar)
-   [https://github.com/jden/bus-sim](https://github.com/jden/bus-sim)

## License
Copyright (c) 2014, Code for America. [ISC license](LICENSE.md).
