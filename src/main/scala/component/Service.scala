package component

import core._

import akka.actor.{Actor, ActorLogging, ActorRef, ActorSelection, Props}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.headers.Accept
import akka.http.scaladsl.server.{Directive0, Route, RouteResult}
import akka.http.scaladsl.server.Directives._
import akka.pattern.ask
import akka.stream.ActorMaterializer
import java.util.UUID
import org.joda.time.DateTime

class Service(val config: Config, val routerDefined: Boolean,
  services: List[Option[User] => Route],
  serviceLinks: List[Option[User] => Directive0])
  extends Actor
  with CommonDirectives
  with ActorLogging
{
  implicit val system = context.system
  implicit val materializer = ActorMaterializer()

  import TokenDirectives._
  import UserDirectives._

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
        pathPrefix("api") {
          optionalToken { optToken =>
            optionalUser(optToken) { optUser =>
              (serviceLinks.map(_(optUser)).reduce(_ & _) & tokenLinks & userItemLinks) {
                headComplete
              } ~
              (tokenLinks & userItemLinks) {
                services.map(_(optUser)).reduce(_ ~ _) ~
                pathPrefix("tokens") {
                  handleTokens
                }
              }
            }
          }
        } ~
        path(Rest) { path =>
          getFromResource(s"public/$path")
        }
      }
    }
  }

  def restartTick(route: Route): Route = {
    if (routerDefined) {
      val tickActor = Supervisor.getChild(TickActor.name)
      requestContext =>
        tickActor ! Restart
        route(requestContext)
    } else route
  }

  def logger(route: Route): Route = {
    if (config.mode == Some("dev")) {
      requestContext =>
        val start = System.currentTimeMillis
        log.debug(requestContext.toString)
        val result = route(requestContext)
        val runningTime = System.currentTimeMillis - start
        log.debug(s"Running time is ${runningTime} ms")
        result
    } else route
  }

  def receive = {
    case _ =>
  }
}

object Service {
  def props(config: Config, routerDefined: Boolean,
    services: List[Option[User] => Route], serviceLinks: List[Option[User] => Directive0]) =
    Props(new Service(config, routerDefined, services, serviceLinks))
  def name = "service"
}
