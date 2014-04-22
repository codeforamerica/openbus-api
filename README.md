# carta-streaming-api

an EventSource-enabled API wrapper for the CARTA streaming API.

## Unstable

There's a very good chance the JSON structure of the current endpoints will be changing to better support GeoJSON. This API should currently be considered unstable. *Any apps you build off of it right now will probably break*

### Basic Usage:

`/buses` is a static JSON response with the latest information from
CARTA. Unfortunately, there's no indication of a timestamp for when
information was last received from the bus. The buses which show up on
here should all be currently active, as far as I can tell from the data
source. Throughout the day, buses will be added and removed from this
list automatically.

`/buses/tail` is a [server-sent events
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

###Apps built so far include:

-   [https://github.com/acedrew/chab.us-maps](https://github.com/acedrew/chab.us-maps)
-   [https://github.com/jden/silly-little-bus-radar](https://github.com/jden/silly-little-bus-radar)


## License
MIT
