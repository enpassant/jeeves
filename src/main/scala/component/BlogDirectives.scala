package component

import core._

import akka.actor.ActorSelection
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.headers.Accept
import akka.http.scaladsl.server.{Route, RouteResult}
import akka.http.scaladsl.server.Directives._
import java.util.UUID
import org.joda.time.DateTime

trait BlogDirectives extends CommentDirectives
  with CommonDirectives with BlogFormats with CommentFormats
{
  def modelBlog: ActorSelection

  def handleBlogs = pathEnd {
    respondWithLinks(
      blogListLink("self"),
      blogItemLink("item", methods = List(GET, PUT, DELETE)),
      blogItemLink("new", "new"))
      {
        headComplete ~
        getList[Blog](modelBlog, Blog)()
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
        getEntity[Blog](modelBlog, blogId) ~
        putEntity[Blog](modelBlog, _.copy(id = blogId), blogId) ~
        deleteEntity[Blog](modelBlog, blogId)
      }
  } ~
  pathPrefix("comments") {
    blogLinks { handleComments(blogId) } ~
    pathPrefix(Segment)(handleComment(blogId) _)
  }

  def blogListLink(rel: String, methods: List[HttpMethod] = List(GET)) =
    collectionLink("/blogs", rel, "List Blogs",
      "accountId date:date title note", methods:_*)

  def blogItemLink(rel: String, blogId: String = ":blogId",
    methods: List[HttpMethod] = List(GET)) =
    mtLink(s"/blogs/$blogId", rel, `application/vnd.enpassant.blog+json`,
      methods:_*)

  def blogLinks = respondWithLinks(
    collectionLink("/blogs", "blogs", "List Blogs",
      "accountId date:date title note", GET),
    mtLink("/blogs/:blogId", "item", `application/vnd.enpassant.blog+json`,
      GET, PUT, POST, DELETE)
  )
}
