package component

import core._

import akka.actor.{Actor, Props}
import java.util.UUID
import org.joda.time.DateTime
import scala.collection.immutable.Map

class ModelToken(val mode: Option[String]) extends Actor {
  val tableToken = IndexedSeq.empty[Token]

  def receive: Receive = process(tableToken)

  def process(tableToken: IndexedSeq[Token]): Receive = {
    case GetEntity(uuid) =>
      sender ! tableToken.find(_.id == uuid.toString)
    case AddEntity(user: User, _*) =>
      val token = Token(UUID.randomUUID.toString, user.id)
      val newTableToken = tableToken.filterNot(_.id == token.id)
        context.become(process(token +: newTableToken))
        sender ! token
    case DeleteEntity(id) =>
      val entity = tableToken.find(_.id == id)
        context.become(process(tableToken.filterNot(_.id == id)))
        sender ! entity
  }
}

object ModelToken {
  def props(mode: Option[String]) = Props(new ModelToken(mode))
  def name = "modelToken"
}
