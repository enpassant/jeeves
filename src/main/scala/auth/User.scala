package component

import core.BaseFormats

import org.json4s.jackson.Serialization.{ read, writePretty }
import org.json4s.{ DefaultFormats, Formats }
import org.joda.time.DateTime
import akka.http.scaladsl.model._
import akka.http.scaladsl.marshalling._
import akka.http.scaladsl.unmarshalling._

case class User(id: String = null, name: Option[String] = None,
  login: Option[String] = None, password: Option[String] = None,
  rolesets: List[Roleset] = List())
{
  def hasRole(role: Role) = rolesets.exists(_.roles.contains(role))
}

case class Login(name: String, password: String)

trait UserFormats extends BaseFormats {
  lazy val `application/vnd.enpassant.user+json` =
    customMediaTypeUTF8("vnd.enpassant.user+json")

  lazy val `application/vnd.enpassant.login+json` =
    customMediaTypeUTF8("vnd.enpassant.login+json")

  implicit val UserUnmarshaller = Unmarshaller.firstOf(
    unmarshaller[User](`application/vnd.enpassant.user+json`),
    unmarshaller[User](MediaTypes.`application/json`))

  implicit val UserMarshaller = Marshaller.oneOf(
    marshaller[User](`application/vnd.enpassant.user+json`),
    marshaller[User](MediaTypes.`application/json`))

  implicit val SeqUserMarshaller = marshaller[Seq[User]](
    `application/collection+json`)

  implicit val LoginUnmarshaller = Unmarshaller.firstOf(
    unmarshaller[Login](`application/vnd.enpassant.login+json`),
    unmarshaller[Login](MediaTypes.`application/json`))

  implicit val LoginMarshaller = Marshaller.oneOf(
    marshaller[Login](`application/vnd.enpassant.login+json`),
    marshaller[Login](MediaTypes.`application/json`))
}
