package component

import core._

import akka.http.scaladsl.model.HttpMethod
import akka.http.scaladsl.model.HttpMethods._

trait BlogsDirectives extends CommonDirectives with BlogFormats with CommentFormats {
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

  def commentListLink(blogId: String, rel: String, methods: HttpMethod*) =
    collectionLink(s"/blogs/$blogId/comments", rel, "List Comments",
      "accountId date:date title note", methods:_*)

  def commentItemLink(blogId: String, rel: String, methods: HttpMethod*) =
    mtLink(s"/blogs/$blogId/comments/:commentId", rel,
      `application/vnd.enpassant.comment+json`, methods:_*)

  def commentLinks(blogId: String) = respondWithLinks(
    collectionLink(s"/blogs/$blogId/comments", "comments", "List Comments",
      "accountId date:date title note", GET),
    mtLink(s"/blogs/$blogId/comments/:commentId", "item",
      `application/vnd.enpassant.comment+json`, GET, PUT, POST, DELETE)
  )
}
