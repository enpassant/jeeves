package component

import core._

import akka.actor.ActorSelection
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.headers.Accept
import akka.http.scaladsl.server.{Route, RouteResult}
import akka.http.scaladsl.server.Directives._
import akka.pattern.ask
import java.util.UUID
import org.joda.time.DateTime

trait CommentDirectives extends CommonDirectives with CommentFormats {
  val modelComment = Supervisor.getChild(ModelComment.name)

  def handleComments(optUser: Option[User], blogId: String) = pathEnd {
    val links = Right.mapActions(optUser, Map(
      commentListLink(blogId, "self") -> Authenticated,
      commentItemLink(blogId, "item") -> Authenticated,
      commentItemLink(blogId, "new", "new") -> Authenticated))

    respondWithLinks(links:_*) {
      headComplete ~
      getList[Comment](modelComment ? _, Comment)(blogId)()
    }
  }

  def handleComment(blogId: String)(commentId: String) = pathEnd {
    (commentLinks(blogId)) {
      headComplete ~
      getEntity[Comment](modelComment ? _, blogId, commentId)() ~
      putEntity[Comment](modelComment ? _, _.copy(id = commentId, blogId = blogId), blogId)() ~
      deleteEntity[Comment](modelComment ? _, blogId, commentId)()
    }
  }

  def commentListLink(blogId: String, rel: String, methods: List[HttpMethod] = List(GET)) =
    collectionLink(s"/blogs/$blogId/comments", rel, "List Comments",
      "accountId date:date title note", methods:_*)

  def commentItemLink(blogId: String, rel: String, commentId: String = ":commentId",
    methods: List[HttpMethod] = List(GET)) =
    mtLink(s"/blogs/$blogId/comments/$commentId", rel,
      `application/vnd.enpassant.comment+json`, methods:_*)

  def commentLinks(blogId: String) = respondWithLinks(
    collectionLink(s"/blogs/$blogId/comments", "comments", "List Comments",
      "accountId date:date title note", GET),
    mtLink(s"/blogs/$blogId/comments/:commentId", "item",
      `application/vnd.enpassant.comment+json`, GET, PUT, POST, DELETE)
  )
}
