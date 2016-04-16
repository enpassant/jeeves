package component

import core._

import akka.actor.{Actor, ActorLogging, ActorRef, ActorSelection, Props}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.headers.{Accept, RawHeader}
import akka.http.scaladsl.server.{Directive0, Route, RouteResult}
import akka.http.scaladsl.server.Directives._
import akka.pattern.ask
import akka.stream.ActorMaterializer
import java.util.UUID
import org.joda.time.DateTime
import scala.collection.immutable.Seq
import scala.concurrent.ExecutionContext

class Service(val config: Config,
  services: List[Option[User] => Route],
  serviceLinks: List[Option[User] => Directive0])
  extends Actor
  with CommonDirectives
  with ActorLogging
{
  implicit val system = context.system
  implicit val materializer = ActorMaterializer()

  import context.dispatcher

  import TokenDirectives._
  import UserDirectives._

  val prefix = "api"
  val bindingFuture = Http().bindAndHandle(route, config.host, config.port)
  bindingFuture foreach { serverBinding =>
    log.info(s"Micro service jeeves listen on ${serverBinding.localAddress}")
    if (config.router.isDefined) {
      val microService = MicroService(UUID.randomUUID.toString, "",
        config.host, serverBinding.localAddress.getPort, config.mode)
      val tickActor = Supervisor.getChild(TickActor.name)
      tickActor ! microService
    }
  }

  def route = {
    logger {
      restartTick {
        prefixRoute(prefix) {
          optionalToken { optToken =>
            optionalUser(optToken) { optUser =>
              (serviceLinks.map(_(optUser)).reduce(_ & _) & tokenLinks & userItemLinks) {
                path("") {
                  headComplete ~
                  getFromResource(s"public/html/index.html")
                }
              } ~
              pathPrefix(prefix) {
                (tokenLinks & userItemLinks) {
                  services.map(_(optUser)).reduce(_ ~ _) ~
                  pathPrefix("tokens") {
                    handleTokens
                  }
                }
              }
            }
          }
        } ~
        path("""([^/]+\.html).*""".r) { path =>
          getFromResource(s"public/html/$path")
        } ~
        path(Rest) { path =>
          getFromResource(s"public/$path")
        }
      }
    }
  }

  def restartTick(route: Route): Route = {
    if (config.router.isDefined) {
      val tickActor = Supervisor.getChild(TickActor.name)
      requestContext =>
        tickActor ! Restart
        route(requestContext)
    } else route
  }

  def prefixRoute(prefix: String)(route: Route)(implicit ec: ExecutionContext): Route =
    requestContext =>
      route(requestContext) map { result =>
        result match {
          case RouteResult.Complete(response) =>
            val mappedResponse = response.mapHeaders(mapLinkHeaders("/" + prefix))
            RouteResult.Complete(mappedResponse)
          case _ => result
        }
      }

  private def mapLinkHeaders(prefix: String)(headers: Seq[HttpHeader]):
    Seq[HttpHeader] = headers.map { header =>
      if (header.name != "Link") header
      else addPrefixTo(prefix)(header)
  }

  private def addPrefixTo(prefix: String)(header: HttpHeader): HttpHeader = {
    val values = header.value.split(",")
    val regexp = "<([^>]+)>(.*)".r
    val prefixedValues = values map { value =>
      regexp.replaceAllIn(value, "<" + prefix + "$1>$2")
    }
    val prefixed = prefixedValues mkString ","
    RawHeader("Link", prefixed)
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
  def props(config: Config,
    services: List[Option[User] => Route], serviceLinks: List[Option[User] => Directive0]) =
    Props(new Service(config, services, serviceLinks))
  def name = "service"
}
