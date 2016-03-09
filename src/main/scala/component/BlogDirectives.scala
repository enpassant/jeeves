package component

import core._
import Roles._

import akka.actor.ActorSelection
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.headers.Accept
import akka.http.scaladsl.server.{Directive1, Route, RouteResult}
import akka.http.scaladsl.server.Directives._
import akka.pattern.ask
import com.github.rjeschke.txtmark.Processor
import java.util.UUID
import org.joda.time.DateTime
import scala.concurrent.Future

object BlogDirectives extends CommentDirectives
  with CommonDirectives with BlogFormats with CommentFormats
{
  import scala.concurrent.ExecutionContext.Implicits.global

  val modelBlog = Supervisor.actorSystem.actorSelection("/user/supervisor/" + ModelBlog.name)

  def handleBlogs(optUser: Option[User]) = pathEnd {
    val itemMethods = Right.mapActions(optUser, Map(
      GET -> Authenticated, PUT -> RoleModifyAll, DELETE -> RoleDeleteAll))

    val links = Right.mapActions(optUser, Map(
      blogListLink("self") -> Everybody,
      blogItemLink("item", methods = itemMethods) -> Authenticated,
      blogItemLink("new", "new") -> RoleAddNew))

    respondWithLinks(links:_*) {
      headComplete ~
      getList[Blog](modelBlog, Blog)()
    }
  } ~
  handleNewBlogs(optUser) ~
  pathPrefix(Segment)(handleBlog(optUser))

  def handleNewBlogs(optUser: Option[User]) = path("new") {
    get {
      Right.checkRight(optUser, RoleAddNew) {
        val uuid = UUID.randomUUID.toString
        val accountId = optUser.flatMap(_.login).getOrElse("")
        respondWithLinks(blogItemLink("self", uuid, methods = List(PUT))) {
          complete(Blog(uuid, accountId, DateTime.now, "", ""))
        }
      }
    }
  }

  def handleBlog(optUser: Option[User])(blogId: String) = pathEnd {
    getBlogDirective(blogId) {
      case Some(blog: Blog) => {
        val isOwnBlog = CustomRight(
          () => optUser.flatMap(_.login).getOrElse("") == blog.accountId)
        val putRight = (RoleModifyAll or (RoleModifyOwn and isOwnBlog))
        val deleteRight = (RoleDeleteAll or (RoleDeleteOwn and isOwnBlog))
        val itemMethods = Right.mapActions(optUser, Map(
          GET -> Authenticated,
          PUT -> putRight,
          DELETE -> deleteRight))

        respondBlogLinks(blogId, itemMethods:_*) {
          headComplete ~
          Right.checkRight(optUser, Authenticated) {
            get {
              parameters('forEdit ? false) { (forEdit: Boolean) =>
                ctx => (modelBlog ? GetEntity(blogId)) flatMap {
                  case Some(entity: Blog) => if (forEdit) {
                    ctx.complete(entity)
                  } else {
                    val blog = entity.copy(note = Processor.process(entity.note))
                    ctx.complete(blog)
                  }
                  case None => ctx.reject()
                }
              }
            }
            //getEntity[Blog](modelBlog, blogId)
          } ~
          Right.checkRight(optUser, putRight) {
            putEntity[Blog](modelBlog, _.copy(id = blogId), blogId)
          } ~
          Right.checkRight(optUser, deleteRight) {
            deleteEntity[Blog](modelBlog, blogId)
          }
        }
      }
      case None =>
        Right.checkRight(optUser, RoleAddNew) {
          respondBlogLinks(blogId, PUT) {
            headComplete ~
            putEntity[Blog](modelBlog, _.copy(id = blogId), blogId)
          }
        }
    }
  } ~
  pathPrefix("comments") {
    blogLinks(optUser) { handleComments(blogId) } ~
    pathPrefix(Segment)(handleComment(blogId) _)
  }

  def respondBlogLinks(blogId: String, methods: HttpMethod*) = respondWithLinks(
      blogListLink("blogs"),
      blogItemLink("self", blogId, methods.toList),
      commentListLink(blogId, "comments", GET),
      commentItemLink(blogId, "new", GET)
  )

  def getBlogDirective(blogId: String): Directive1[Option[Blog]] = {
    onSuccess(modelBlog ? GetEntity(blogId)) flatMap {
      case Some(blog: Blog) => provide(Some(blog))
      case None => provide(None)
    }
  }

  def blogListLink(rel: String, methods: List[HttpMethod] = List(GET)) =
    collectionLink("/blogs", rel, "List Blogs",
      "title accountId date:date", methods:_*)

  def blogItemLink(rel: String, blogId: String = ":blogId",
    methods: List[HttpMethod] = List(GET)) =
    mtLink(s"/blogs/$blogId", rel, `application/vnd.enpassant.blog+json`,
      methods:_*)

  def blogLinks(optUser: Option[User]) = {
    respondWithLinks(
      collectionLink("/blogs", "blogs", "List Blogs",
        "title accountId date:date", GET)
    )
  }
}
