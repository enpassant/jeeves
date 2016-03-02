package component

import core.BaseFormats

import org.json4s.jackson.Serialization.{ read, writePretty }
import org.json4s.{ DefaultFormats, Formats }
import org.joda.time.DateTime
import akka.http.scaladsl.model._
import akka.http.scaladsl.marshalling._
import akka.http.scaladsl.unmarshalling._
import akka.http.scaladsl.server.{Route}
import akka.http.scaladsl.server.Directives._

sealed trait Right {
  def or(right: Right) = OrRight(this, right)
  def and(right: Right) = AndRight(this, right)
}

object Everybody extends Right
object Authenticated extends Right
case class Role(id: String = null) extends Right
case class CustomRight(fn: () => Boolean) extends Right
case class OrRight(right1: Right, right2: Right) extends Right
case class AndRight(right1: Right, right2: Right) extends Right

trait RoleFormats extends BaseFormats {
  lazy val `application/vnd.enpassant.role+json` =
    customMediaTypeUTF8("vnd.enpassant.role+json")

  implicit val RoleUnmarshaller = Unmarshaller.firstOf(
    unmarshaller[Role](`application/vnd.enpassant.role+json`),
    unmarshaller[Role](MediaTypes.`application/json`))

  implicit val RoleMarshaller = Marshaller.oneOf(
    marshaller[Role](`application/vnd.enpassant.role+json`),
    marshaller[Role](MediaTypes.`application/json`))

  implicit val SeqRoleMarshaller = marshaller[Seq[Role]](
    MediaTypes.`application/json`)
}

object Right {
  def hasRight(optUser: Option[User], right: Right): Boolean = (optUser, right) match {
    case (_, Everybody) => true
    case (_, Authenticated) => optUser.isDefined
    case (Some(user), role: Role) => user .hasRole(role)
    case (_, CustomRight(fn)) => fn()
    case (_, OrRight(right1, right2)) => hasRight(optUser, right1) || hasRight(optUser, right2)
    case (_, AndRight(right1, right2)) => hasRight(optUser, right1) && hasRight(optUser, right2)
    case _ => false
  }

  def mapActions[T](optUser: Option[User], actions: Map[T,Right]): List[T] = {
    actions.toList flatMap { case (action, right) =>
      if (hasRight(optUser, right)) List(action) else List()
    }
  }

  def checkRight(optUser: Option[User], right: Right)(route: Route): Route = {
    if (hasRight(optUser, right)) route else complete(StatusCodes.Unauthorized)
  }
}
