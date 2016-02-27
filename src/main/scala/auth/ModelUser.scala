package component

import core._

import akka.actor.{Actor, Props}
import java.util.UUID
import org.joda.time.DateTime
import scala.collection.immutable.Map

class ModelUser(val mode: Option[String]) extends Actor {
  // Dummy data for illustration purposes, in ascending order by date
  val tableUser = List(
    User(UUID.randomUUID.toString, Some("Jim"), Some("jim"), Some("jim123"), List()),
    User(UUID.randomUUID.toString, Some("John"), Some("john"), Some("john123"), List()),
    User(UUID.randomUUID.toString, Some("Fred"), Some("fred"), Some("fred123"), List())
  )

  def receive: Receive = process(tableUser)

  def process(tableUser: List[User]): Receive = {
    case Login(name, password) =>
      sender ! tableUser.find { user =>
        user.login == Option(name) && user.password == Option(password)
      }
    case GetEntity(uuid) =>
      sender ! tableUser.find(_.id == uuid.toString)
    case ListWithOffset(User, _, offset, limit) =>
      sender ! EntityList(tableUser.drop(offset).take(limit))
    case AddEntity(user: User, _*) =>
      val newTableUser = tableUser.filterNot(_.id == user.id)
        context.become(process(user +: newTableUser))
        sender ! user
    case DeleteEntity(id) =>
      val entity = tableUser.find(_.id == id)
        context.become(process(tableUser.filterNot(_.id == id)))
        sender ! entity
  }
}

object ModelUser {
  def props(mode: Option[String]) = Props(new ModelUser(mode))
  def name = "modelUser"
}
