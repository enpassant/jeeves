package component

import core.BaseFormats

import org.json4s.jackson.Serialization.{ read, writePretty }
import org.json4s.{ DefaultFormats, Formats }
import org.joda.time.DateTime
import akka.http.scaladsl.model._
import akka.http.scaladsl.marshalling._
import akka.http.scaladsl.unmarshalling._

case class User(id: String = null, name: String, rolesets: List[Roleset] = List())

trait UserFormats extends BaseFormats {
  lazy val `application/vnd.enpassant.user+json` =
    customMediaTypeUTF8("vnd.enpassant.user+json")

  implicit val UserUnmarshaller = Unmarshaller.firstOf(
    unmarshaller[User](`application/vnd.enpassant.user+json`),
    unmarshaller[User](MediaTypes.`application/json`))

  implicit val UserMarshaller = Marshaller.oneOf(
    marshaller[User](`application/vnd.enpassant.user+json`),
    marshaller[User](MediaTypes.`application/json`))

  implicit val SeqUserMarshaller = marshaller[Seq[User]](
    MediaTypes.`application/json`)
}

