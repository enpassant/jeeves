package component

import core.BaseFormats

import org.json4s.jackson.Serialization.{ read, writePretty }
import org.json4s.{ DefaultFormats, Formats }
import org.joda.time.DateTime
import akka.http.scaladsl.model._
import akka.http.scaladsl.marshalling._
import akka.http.scaladsl.unmarshalling._

case class Roleset(id: String = null, roles: List[Role] = List())

trait RolesetFormats extends BaseFormats {
  lazy val `application/vnd.enpassant.roleset+json` =
    customMediaTypeUTF8("vnd.enpassant.roleset+json")

  implicit val RolesetUnmarshaller = Unmarshaller.firstOf(
    unmarshaller[Roleset](`application/vnd.enpassant.roleset+json`),
    unmarshaller[Roleset](MediaTypes.`application/json`))

  implicit val RolesetMarshaller = Marshaller.oneOf(
    marshaller[Roleset](`application/vnd.enpassant.roleset+json`),
    marshaller[Roleset](MediaTypes.`application/json`))

  implicit val SeqRolesetMarshaller = marshaller[Seq[Roleset]](
    MediaTypes.`application/json`)
}

