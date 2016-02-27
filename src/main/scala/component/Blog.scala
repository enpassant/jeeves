package component

import core.BaseFormats

import org.json4s.jackson.Serialization.{ read, writePretty }
import org.json4s.{ DefaultFormats, Formats }
import org.joda.time.DateTime
import akka.http.scaladsl.model._
import akka.http.scaladsl.marshalling._
import akka.http.scaladsl.unmarshalling._

case class Token(id: String = null, userId: String, date: DateTime = DateTime.now)

trait TokenFormats extends BaseFormats {
  lazy val `application/vnd.enpassant.token+json` =
    customMediaTypeUTF8("vnd.enpassant.token+json")

  implicit val TokenUnmarshaller = Unmarshaller.firstOf(
    unmarshaller[Token](`application/vnd.enpassant.token+json`),
    unmarshaller[Token](MediaTypes.`application/json`))

  implicit val TokenMarshaller = Marshaller.oneOf(
    marshaller[Token](`application/vnd.enpassant.token+json`),
    marshaller[Token](MediaTypes.`application/json`))
}
