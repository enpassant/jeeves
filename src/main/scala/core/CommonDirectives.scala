package core

import component._

import akka.actor.ActorSelection
import akka.http.scaladsl.marshalling._
import akka.http.scaladsl.unmarshalling._
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.headers.{Accept, HttpChallenge, Link,
  LinkParams, LinkValue, RawHeader}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.{AuthenticationFailedRejection, Rejection}
import akka.pattern.ask
import akka.util.Timeout
import scala.concurrent.duration._
import scala.reflect.ClassTag

trait CommonDirectives extends BaseFormats {
  implicit val timeout = Timeout(10.seconds)
  import scala.concurrent.ExecutionContext.Implicits.global

  def headComplete = (options | head) { complete("") }

  def link(uri: String, rel: String, mt: MediaType, params: Map[String, String]) = {
    val linkValue = LinkValue(Uri(uri),
      LinkParams.rel(rel),
      LinkParams.`type`(mt))
    val linkStr = linkValue.toString

    if (params.isEmpty) linkStr
    else {
      val paramStr = params.map { case (key, value) => s"""$key="$value"""" }
      s"""$linkStr; ${paramStr.mkString("; ")}"""
    }
  }

  def mtLink(uri: String, rel: String, mt: MediaType, methods: HttpMethod*) = {
    val method = methods.map(_.name).mkString(" ")
    link(uri, rel, mt, Map("method" -> method))
  }

  def collectionLink(uri: String, rel: String, title: String,
    columns: String, methods: HttpMethod*) =
  {
    val method = methods.map(_.name).mkString(" ")
    link(uri, rel, `application/collection+json`,
      Map("title" -> title, "method" -> method, "columns" -> columns))
  }

  def jsonLink(uri: String, rel: String, methods: HttpMethod*) = {
    val method = methods.map(_.name).mkString(" ")
    link(uri, rel, MediaTypes`application/json`, Map("method" -> method))
  }

  def respondWithLinks(links: String*) = respondWithHeader(
    RawHeader("Link", links.mkString(",")))

  def mediaTypeVersion(mediaType: MediaType) = headerValuePF {
    case Accept(mediaRanges)
      if mediaRanges.exists(mt => mt.matches(mediaType)) =>
        mediaRanges.find(mt => mt.matches(mediaType)).flatMap( _.params get "version")
  }

  def getList[T: ClassTag](modelFunction: Model.Function, t: Any)(params: Any*)
    (rejections: Rejection*)
    (implicit m: ToEntityMarshaller[Seq[T]]) = get
  {
    parameters('offset ? 0, 'limit ? 5) { (offset: Int, limit: Int) =>
      { ctx =>
        (modelFunction(ListWithOffset(t, params, offset, limit))) flatMap {
          case EntityList(slice: Iterable[T @unchecked]) => ctx.complete(slice.toSeq)
          case _ => ctx.reject(rejections:_*)
        }
      }
    }
  }

  def getEntity[T: ClassTag](modelFunction: Model.Function, ids: String*)
    (rejections: Rejection*)
    (implicit m: ToEntityMarshaller[T]) = get
  {
    { ctx =>
      (modelFunction(GetEntity(ids:_*))) flatMap {
        case Some(entity: T) => ctx.complete(entity)
        case _ => ctx.reject(rejections:_*)
      }
    }
  }

  def putEntity[T : ClassTag](modelFunction: Model.Function, modify: T => T, ids: String*)
    (rejections: Rejection*)
    (implicit u: FromRequestUnmarshaller[T], m: ToEntityMarshaller[T]) = put {
      entity(as[T]) { entity => ctx =>
        (modelFunction(AddEntity(modify(entity), ids:_*))) flatMap {
          case entity: T => ctx.complete(entity)
          case _ => ctx.reject(rejections:_*)
        }
      }
    }

  def postEntity[T: ClassTag, U: ClassTag](modelFunction: Model.Function, ids: String*)
    (rejections: Rejection*)
    (implicit u: FromRequestUnmarshaller[T], m: ToEntityMarshaller[U]) = post {
      entity(as[T]) { entity => ctx =>
        (modelFunction(AddEntity(entity, ids:_*))) flatMap {
          case entity: U => ctx.complete(entity)
          case _ => ctx.reject(rejections:_*)
        }
      }
    }

  def deleteEntity[T: ClassTag](modelFunction: Model.Function, ids: String*)
    (rejections: Rejection*)
    (implicit m: ToEntityMarshaller[T]) = delete
  {
    { ctx =>
      (modelFunction(DeleteEntity(ids:_*))) flatMap {
        case Some(entity: T) => ctx.complete(entity)
        case _ => ctx.reject(rejections:_*)
      }
    }
  }
}
