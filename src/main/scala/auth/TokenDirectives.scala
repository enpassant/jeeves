package component

import core._

import akka.actor.ActorSelection
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.headers.Accept
import akka.http.scaladsl.server.{Directive1, Route, RouteResult}
import akka.http.scaladsl.server.Directives._
import akka.pattern.ask
import java.util.UUID
import org.joda.time.DateTime
import scala.concurrent.Future

trait TokenDirectives extends CommentDirectives
  with CommonDirectives with TokenFormats with CommentFormats
{
  import scala.concurrent.ExecutionContext.Implicits.global

  def modelToken: ActorSelection

  def handleTokens = pathEnd {
    headComplete ~
    postEntity[User, Token](modelToken)
  }

  //def handleNewTokens = path("new") {
    //get {
      //val uuid = UUID.randomUUID.toString
      //respondWithLinks(tokenItemLink("self", uuid, methods = List(PUT))) {
        //complete(Token(uuid, "john", DateTime.now, "", ""))
      //}
    //}
  //}

  //def handleToken(tokenId: String) = pathEnd {
    //getTokenDirective(tokenId) {
      //case Some(token: Token) => {
        //respondTokenLinks(tokenId, GET, PUT, DELETE) {
          //headComplete ~
          //getEntity[Token](modelToken, tokenId) ~
          //putEntity[Token](modelToken, _.copy(id = tokenId), tokenId) ~
          //deleteEntity[Token](modelToken, tokenId)
        //}
      //}
      //case None =>
        //respondTokenLinks(tokenId, PUT) {
          //headComplete ~
          //putEntity[Token](modelToken, _.copy(id = tokenId), tokenId)
        //}
    //}
  //} ~
  //pathPrefix("comments") {
    //tokenLinks { handleComments(tokenId) } ~
    //pathPrefix(Segment)(handleComment(tokenId) _)
  //}

  //def respondTokenLinks(tokenId: String, methods: HttpMethod*) = respondWithLinks(
      //tokenListLink("tokens"),
      //tokenItemLink("self", tokenId, methods.toList),
      //commentListLink(tokenId, "comments", GET),
      //commentItemLink(tokenId, "new", GET)
  //)

  //def getTokenDirective(tokenId: String): Directive1[Option[Token]] = {
    //onSuccess(modelToken ? GetEntity(tokenId)) flatMap {
      //case Some(token: Token) => provide(Some(token))
      //case None => provide(None)
    //}
  //}

  def tokenListLink(rel: String, methods: List[HttpMethod] = List(GET)) =
    collectionLink("/tokens", rel, "List Tokens",
      "accountId date:date title note", methods:_*)

  def tokenItemLink(rel: String, tokenId: String = ":tokenId",
    methods: List[HttpMethod] = List(GET)) =
    mtLink(s"/tokens/$tokenId", rel, `application/vnd.enpassant.token+json`,
      methods:_*)

  def tokenLinks = respondWithLinks(
    collectionLink("/tokens", "tokens", "List Tokens",
      "accountId date:date title note", GET),
    mtLink("/tokens/:tokenId", "item", `application/vnd.enpassant.token+json`,
      GET, PUT, POST, DELETE)
  )
}
