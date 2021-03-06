package component

import core.BaseFormats

import org.json4s.jackson.Serialization.{ read, writePretty }
import org.json4s.{ DefaultFormats, Formats }
import org.joda.time.DateTime
import akka.http.scaladsl.model._
import akka.http.scaladsl.marshalling._
import akka.http.scaladsl.unmarshalling._

case class Blog(id: String = null, accountId: String,
  date: DateTime = DateTime.now, title: String, note: String)

trait BlogFormats extends BaseFormats {
  lazy val `application/vnd.enpassant.blog+json` =
    customMediaTypeUTF8("vnd.enpassant.blog+json")
  lazy val `application/vnd.enpassant.blog-v2+json` =
    customMediaTypeUTF8("vnd.enpassant.blog-v2+json")

  implicit val BlogUnmarshaller = Unmarshaller.firstOf(
    unmarshaller[Blog](`application/vnd.enpassant.blog-v2+json`),
    unmarshaller[Blog](`application/vnd.enpassant.blog+json`),
    unmarshaller[Blog](MediaTypes.`application/json`))

  implicit val BlogMarshaller = Marshaller.oneOf(
    marshaller[Blog](`application/vnd.enpassant.blog-v2+json`),
    marshaller[Blog](`application/vnd.enpassant.blog+json`),
    marshaller[Blog](MediaTypes.`application/json`))

  implicit val SeqBlogMarshaller = marshaller[Seq[Blog]](
    `application/collection+json`)
}
