# jeeves
Simple WEB server based on akka-http

# Features
* RESTful interaction is driven by hypermedia: [HATEOAS](https://en.wikipedia.org/wiki/HATEOAS)
* Super-fast development turnaround: [sbt-revolver](https://github.com/spray/sbt-revolver)
* Super-fast UI MVC javascript framework: [mithril](https://lhorie.github.io/mithril/index.html)
* Fast and simple to use Http stack top on Akka actors: [akka-http](http://doc.akka.io/docs/akka-stream-and-http-experimental/2.0.3/scala/http/introduction.html)
* Modularized and optimized javascript code: [requirejs](http://requirejs.org/)
* Explicitly and easily manage the client-side dependencies with CDN [webjars](http://www.webjars.org/)
* Beautiful and responsive layouts using human-friendly HTML: [Semantic-UI](http://semantic-ui.com/)
* Stand-alone executable without any application server
* Configurable with command line arguments: [scopt](https://github.com/scopt/scopt)
* Composable with [james](https://github.com/enpassant/james) and another [jeeves](https://github.com/enpassant/jeeves) with the help of [psmith](https://github.com/enpassant/psmith)
* Build application packages in native formats: [sbt-native-packager](https://github.com/sbt/sbt-native-packager)

# Usage
## Running in development mode
> ~reStart

More options: [sbt-revolver](https://github.com/spray/sbt-revolver)

###Command line arguments:
```
-h <value> | --host <value>
    host. Default: localhost

-p <value> | --port <value>
    port number. Default: 9000

-r <value> | --router <value>
    router's host and port. e.g.: localhost:9101

-m <value> | --mode <value>
    running mode. e.g.: dev, test
```

## Packaging
> universal:packageBin

More options: [sbt-native-packager](https://github.com/sbt/sbt-native-packager)
