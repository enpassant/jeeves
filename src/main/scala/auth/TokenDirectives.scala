package component

import core._

import akka.actor.ActorSelection
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.headers.{Accept, HttpChallenge}
import akka.http.scaladsl.server.{AuthenticationFailedRejection, Directive1, Route, RouteResult}
import akka.http.scaladsl.server.Directives._
import akka.pattern.ask
import java.util.UUID
import org.joda.time.DateTime
import scala.concurrent.Future

object TokenDirectives extends CommentDirectives
  with CommonDirectives with TokenFormats with CommentFormats
{
  import scala.concurrent.ExecutionContext.Implicits.global

  val modelToken = Supervisor.getChild(ModelToken.name)

  def optionalToken: Directive1[Option[Token]] =
    optionalHeaderValueByName("X-Auth-Token") flatMap
  {
    case Some(tokenId) =>
      onSuccess((modelToken ? GetEntity[Token](tokenId))) flatMap {
        case Some(token: Token) => provide(Some(token))
        case _ => provide(None)
      }
    case None => provide(None)
  }

  def handleTokens = pathEnd {
    headComplete ~
    postEntity[Login, Token](modelToken ? _)(new AuthenticationFailedRejection(
      AuthenticationFailedRejection.CredentialsRejected,
        HttpChallenge("Token", "Jeeves")))
  } ~
  path(Segment) { tokenId =>
    getEntity[Token](modelToken ? _, tokenId)() ~
    deleteEntity[Token](modelToken ? _, tokenId)()
  }

  def tokenLinks = respondWithLinks(
    mtLink("/tokens", "login", `application/vnd.enpassant.token+json`, POST),
    mtLink("/tokens/:tokenId", "token", `application/vnd.enpassant.token+json`, GET, DELETE)
  )
}
