package component

import core._
import Roles._

import akka.actor.ActorSelection
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.headers.Accept
import akka.http.scaladsl.server.{Directive1, Route, RouteResult}
import akka.http.scaladsl.server.Directives._
import com.github.rjeschke.txtmark.Processor
import java.util.UUID
import org.joda.time.DateTime
import scala.concurrent.Future

object BlogDirectives extends CommentDirectives
  with CommonDirectives with BlogFormats with CommentFormats
{
  import scala.concurrent.ExecutionContext.Implicits.global

  val blogService = (prefix: String, modelFunction: Model.Function) =>
    (optUser: Option[User]) => pathPrefix(prefix) {
      handleBlogs(modelFunction)(optUser)
    }

  def handleBlogs(modelFunction: Model.Function)(optUser: Option[User]) = pathEnd {
    val itemMethods = Right.mapActions(optUser, Map(
      GET -> Authenticated, PUT -> RoleModifyAll, DELETE -> RoleDeleteAll))

    val links = Right.mapActions(optUser, Map(
      blogListLink("self") -> Everybody,
      blogItemLink("item", methods = itemMethods) -> Authenticated,
      blogItemLink("new", "new") -> RoleAddNew))

    respondWithLinks(links:_*) {
      headComplete ~
      getList[Blog](modelFunction, Blog)()()
    }
  } ~
  handleNewBlogs(optUser) ~
  pathPrefix(Segment)(handleBlog(modelFunction)(optUser))

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

  def handleBlog(modelFunction: Model.Function)(optUser: Option[User])(blogId: String) =
    pathEnd
  {
    getBlogDirective(modelFunction)(blogId) {
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
                ctx => (modelFunction(GetEntity(blogId))) flatMap {
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
            putEntity[Blog](modelFunction, _.copy(id = blogId), blogId)()
          } ~
          Right.checkRight(optUser, deleteRight) {
            deleteEntity[Blog](modelFunction, blogId)()
          }
        }
      }
      case None =>
        Right.checkRight(optUser, RoleAddNew) {
          respondBlogLinks(blogId, PUT) {
            headComplete ~
            putEntity[Blog](modelFunction, _.copy(id = blogId), blogId)()
          }
        }
    }
  } ~
  pathPrefix("comments") {
    blogLinks(optUser) { handleComments(optUser, blogId) } ~
    pathPrefix(Segment)(handleComment(blogId) _)
  }

  def respondBlogLinks(blogId: String, methods: HttpMethod*) = respondWithLinks(
      blogListLink("blogs"),
      blogItemLink("self", blogId, methods.toList),
      blogItemLink("edit", blogId + "?forEdit=true", List(GET)),
      commentListLink(blogId, "comments"),
      commentItemLink(blogId, "new", "new", List(GET))
  )

  def getBlogDirective(modelFunction: Model.Function)(blogId: String):
    Directive1[Option[Blog]] =
  {
    onSuccess(modelFunction(GetEntity(blogId))) flatMap {
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
