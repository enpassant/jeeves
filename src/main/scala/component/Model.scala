package component

import core._
import scala.concurrent.Future

trait ModelStatement

case class GetEntity[T](ids: String*) extends ModelStatement
case class ListWithOffset(t: Any, params: Seq[Any], offset: Int, limit: Int)
  extends ModelStatement
case class EntityList[T](slice: Iterable[T]) extends ModelStatement
case class AddEntity[T](blog: T, ids: String*) extends ModelStatement
case class DeleteEntity(ids: String*) extends ModelStatement

object Model {
  type Function = ModelStatement => Future[Any]
}
