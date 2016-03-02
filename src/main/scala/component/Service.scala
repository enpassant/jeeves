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
  with CommonDirectives
  with ActorLogging
{
  import context.dispatcher
  implicit val system = context.system
  implicit val materializer = ActorMaterializer()

  import BlogDirectives._
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
              (blogLinks(optUser) & tokenLinks & userMenuLinks & userItemLinks) {
                headComplete
              } ~
              (tokenLinks & userItemLinks) {
                pathPrefix("blogs") {
                  handleBlogs(optUser)
                } ~
                pathPrefix("tokens") {
                  handleTokens
                } ~
                pathPrefix("users") {
                  handleUsers()
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

  def optionalUser(token: Option[Token])(route: Option[User] => Route): Route = {
    val user = token match {
      case Some(t) =>
        (modelUser ? GetEntity[User](t.userId)) map {
          case Some(user: User) => Some(user)
          case _ => None
        }
      case _ => Future(None)
    }
    ctx => user flatMap ( u => route(u)(ctx) )
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
  def props(config: Config, routerDefined: Boolean) =
    Props(new Service(config, routerDefined))
  def name = "service"
}
