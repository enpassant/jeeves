package component

import core._

import akka.actor.{Actor, ActorLogging, ActorRefFactory, Props}
import akka.pattern.ask
import akka.util.Timeout
import java.util.UUID
import org.joda.time.DateTime
import scala.collection.immutable.Map
import scala.concurrent.duration._

class ModelToken(val mode: Option[String]) extends Actor with ActorLogging {
  implicit val timeout = Timeout(10.seconds)
  import scala.concurrent.ExecutionContext.Implicits.global

  val modelUser = context.actorSelection("../" + ModelUser.name)

  val tableToken = IndexedSeq.empty[Token]

  def receive: Receive = process(tableToken)

  def process(tableToken: IndexedSeq[Token]): Receive = {
    case GetEntity(uuid) =>
      sender ! tableToken.find(_.id == uuid.toString)

    case AddEntity(login: Login, _*) =>
      val userFuture = (modelUser ? Login(login.name, login.password))
      val service = sender
      userFuture onSuccess {
        case Some(user: User) =>
          val token = Token(UUID.randomUUID.toString, user.id)
          val newTableToken = tableToken.filterNot(_.id == token.id)
          service ! token
          context.become(process(token +: newTableToken))
        case None =>
          service ! None
      }

    case DeleteEntity(id) =>
      val entity = tableToken.find(_.id == id)
        context.become(process(tableToken.filterNot(_.id == id)))
        sender ! entity
  }
}

object ModelToken {
  def name = "modelToken"
  def apply(mode: Option[String])(implicit factory: ActorRefFactory) =
    factory.actorOf(Props(new ModelToken(mode)), name)
}
