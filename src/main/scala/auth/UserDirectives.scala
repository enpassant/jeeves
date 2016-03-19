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

object UserDirectives extends CommonDirectives with BlogFormats with UserFormats {
  val modelUser = Supervisor.getChild(ModelUser.name)

  def handleUsers(optUser: Option[User]) = pathEnd {
    val links = Right.mapActions(optUser, Map(
      userListLink("self") -> Authenticated
    ))

    respondWithLinks(links:_*) {
      headComplete ~
      getList[User](modelUser, User)()()
    }
  } ~
  pathPrefix(Segment)(handleUser)

  def handleUser(userId: String) = pathEnd {
    headComplete ~
    getEntity[User](modelUser, userId)() ~
    putEntity[User](modelUser, _.copy(id = userId), userId)() ~
    deleteEntity[User](modelUser, userId)()
  }

  def userListLink(rel: String, methods: List[HttpMethod] = List(GET)) =
    collectionLink(s"/users", rel, "", "login name", methods:_*)

  def userItemLink(rel: String, userId: String = ":userId",
    methods: List[HttpMethod] = List(GET)) =
    mtLink(s"/users/$userId", rel,
      `application/vnd.enpassant.user+json`, methods:_*)

  def userMenuLinks(optUser: Option[User]) = {
    val links = Right.mapActions(optUser, Map(
      collectionLink(s"/users", "users", "List Users", "login name", GET) -> Authenticated
    ))

    respondWithLinks(links:_*)
  }

  def userItemLinks() = respondWithLinks(
    mtLink(s"/users/:userId", "user", `application/vnd.enpassant.user+json`, GET)
  )
}
