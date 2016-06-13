package component

import core._

import akka.actor.{Actor, ActorRefFactory, ActorLogging, ActorRef, Props}
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.HttpMethods._
import akka.http.scaladsl.model.headers.Accept
import akka.http.scaladsl.server.{Route, RouteResult}
import akka.http.scaladsl.server.Directives._
import akka.pattern.ask
import akka.util.Timeout
import java.util.UUID
import org.joda.time.DateTime
import scala.concurrent.Future
import scala.concurrent.duration._

class UserService(prefix: String) extends Actor with ActorLogging {
  import scala.concurrent.ExecutionContext.Implicits.global
  implicit val timeout = Timeout(3.seconds)

  def receive = {
    case UseModel(Some(modelActor)) => context.become(process(modelActor))
    case msg => log.warning("Unknown message: {}", msg)
  }

  def process(modelActor: ActorRef): Receive = {
    case GetServiceRoute(optUser) =>
      sender ! UserDirectives.userService(prefix, modelActor ? _)(optUser)
    case UseModel(None) => context.become(receive)
    case msg => log.warning("Unknown message at process: {}", msg)
  }
}

object UserService {
  def apply(prefix: String)(implicit factory: ActorRefFactory) =
    factory.actorOf(Props(new UserService(prefix)))
}

object UserDirectives extends CommonDirectives with UserFormats {
  import scala.concurrent.ExecutionContext.Implicits.global

  val modelUser = Supervisor.getChild(ModelUser.name)

  val userService = (prefix: String, modelFunction: Model.Function) =>
    (optUser: Option[User]) => pathPrefix(prefix) {
      handleUsers(modelFunction)(optUser)
    }

  def handleUsers(modelFunction: Model.Function)(optUser: Option[User]) = pathEnd {
    val links = Right.mapActions(optUser, Map(
      userListLink("self") -> Authenticated
    ))

    respondWithLinks(links:_*) {
      headComplete ~
      getList[User](modelFunction, User)()()
    }
  } ~
  pathPrefix(Segment)(handleUser(modelFunction: Model.Function))

  def handleUser(modelFunction: Model.Function)(userId: String) = pathEnd {
    headComplete ~
    getEntity[User](modelFunction, userId)() ~
    putEntity[User](modelFunction, _.copy(id = userId), userId)() ~
    deleteEntity[User](modelFunction, userId)()
  }

  def optionalUser(token: Option[Token])(route: Option[User] => Route): Route = {
    val user = token match {
      case Some(t) =>
        (modelUser ? GetEntity[User](t.userId)) map {
          case Some(user: User) => Some(user)
          case _ => None
        }
      case _ => Future(None)
    }
    ctx => user flatMap ( u => route(u)(ctx) )
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
