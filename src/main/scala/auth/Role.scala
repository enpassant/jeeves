package component

import core.BaseFormats

import org.json4s.jackson.Serialization.{ read, writePretty }
import org.json4s.{ DefaultFormats, Formats }
import org.joda.time.DateTime
import akka.http.scaladsl.model._
import akka.http.scaladsl.marshalling._
import akka.http.scaladsl.unmarshalling._

case class Role(id: String = null)

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

