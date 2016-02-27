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
    postEntity[Login, Token](modelToken)
  } ~
  path(Segment) { tokenId =>
    getEntity[Token](modelToken, tokenId) ~
    deleteEntity[Token](modelToken, tokenId)
  }

  def tokenLinks = respondWithLinks(
    mtLink("/tokens", "login", `application/vnd.enpassant.token+json`, POST),
    mtLink("/tokens/:tokenId", "token", `application/vnd.enpassant.token+json`, GET, DELETE)
  )
}
