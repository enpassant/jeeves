package component

import core._

import akka.actor.{Actor, ActorLogging, ActorRef, ActorSelection, Props}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.headers.Accept
import akka.http.scaladsl.server.{Route, RouteResult}
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import akka.pattern.ask
import akka.pattern.ask
import akka.util.Timeout
import java.util.UUID
import scala.concurrent.Future
import scala.concurrent.duration._
import org.joda.time.DateTime

class Service(val config: Config, val routerDefined: Boolean)
    extends Actor
    with BlogDirectives
    with ActorLogging
{
    val modelBlog = context.actorSelection("../" + ModelBlog.name)
    val modelComment = context.actorSelection("../" + ModelComment.name)

    val tickActor: Option[ActorSelection] =
        if (routerDefined) Some(context.actorSelection("../" + TickActor.name))
        else None

    import context.dispatcher
    implicit val system = context.system
    implicit val materializer = ActorMaterializer()

    val bindingFuture = Http().bindAndHandle(route, config.host, config.port)

    def route = {
        logger {
            restartTick {
                path("") {
                    getFromResource(s"public/html/index.html")
                } ~
                path("""([^/]+\.html).*""".r) { path =>
                    getFromResource(s"public/html/$path")
                } ~
                pathPrefix("api" / "blogs") {
                    handleBlogs ~
                    handleNewBlogs ~
                    pathPrefix(Segment)(handleBlog)
                } ~
                pathPrefix("api") {
                    blogLinks { headComplete }
                } ~
                path(Rest) { path =>
                    getFromResource(s"public/$path")
                }
            }
        }
    }

    def restartTick(route: Route): Route = { requestContext =>
        tickActor map { _ ! Restart }
        route(requestContext)
    }

    def logger(route: Route): Route = {
        if (config.mode == Some("dev")) {
            requestContext =>
                val start = System.currentTimeMillis
                println(requestContext)
                val result = route(requestContext)
                val runningTime = System.currentTimeMillis - start
                println(s"Running time is ${runningTime} ms")
                result
        } else route
    }

    def receive = {
        case _ =>
    }
}

object Service {
    def props(config: Config, routerDefined: Boolean) =
        Props(new Service(config, routerDefined))
    def name = "service"
}
