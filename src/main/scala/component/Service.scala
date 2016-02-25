package component

import core._

import akka.actor.{Actor, ActorLogging, ActorRef, ActorSelection, Props}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.{ContentType, ContentTypes, HttpEntity, HttpResponse, MediaTypes}
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
    with BlogFormats
    with CommentFormats
    with BlogsDirectives
    with ActorLogging
{
    val model = context.actorSelection("../" + Model.name)
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

    def handleBlogs = pathEnd {
        respondWithLinks(
            blogListLink("self"),
            blogItemLink("item", methods = List(GET, PUT, DELETE)),
            blogItemLink("new", "new"))
        {
            headComplete ~
            getList[Blog](Blog)()
        }
    }

    def handleNewBlogs = path("new") {
        get {
            val uuid = UUID.randomUUID.toString
            respondWithLinks(blogItemLink("self", uuid, methods = List(GET, PUT))) {
                complete(Blog(uuid, "john", DateTime.now, "", ""))
            }
        }
    }

    def handleBlog(blogId: String) = pathEnd {
        respondWithLinks(
            blogListLink("blogs"),
            blogItemLink("self", blogId, methods = List(GET, PUT, DELETE)),
            commentListLink(blogId, "comments", GET),
            commentItemLink(blogId, "new", PUT))
        {
            headComplete ~
            getEntity[Blog](blogId) ~
            putEntity[Blog](_.copy(id = blogId), blogId) ~
            deleteEntity[Blog](blogId)
        }
    } ~
    pathPrefix("comments") {
        handleComments(blogId) ~
        pathPrefix(Segment)(handleComment(blogId) _)
    }

    def handleComments(blogId: String) = pathEnd {
        commentLinks(blogId) {
            headComplete ~
            getList[Comment](Comment)(blogId)
        }
    }

    def handleComment(blogId: String)(commentId: String) = pathEnd {
        (blogLinks & commentLinks(blogId)) {
            headComplete ~
            getEntity[Comment](blogId, commentId) ~
            putEntity[Comment](_.copy(id = commentId, blogId = blogId), blogId) ~
            deleteEntity[Comment](blogId, commentId)
        }
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
// vim: set ts=4 sw=4 et:
