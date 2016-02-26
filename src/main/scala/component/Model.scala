package component

import core._

case class GetEntity[T](ids: String*)
case class ListWithOffset(t: Any, params: Seq[Any], offset: Int, limit: Int)
case class EntityList[T](slice: Iterable[T])
case class AddEntity[T](blog: T, ids: String*)
case class DeleteEntity(ids: String*)
// vim: set ts=4 sw=4 et:
