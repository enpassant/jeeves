package component

import core._

import akka.actor.{Actor, Props}
import java.util.UUID
import org.joda.time.DateTime
import scala.collection.immutable.Map

class ModelComment(val mode: Option[String]) extends Actor {
  // Dummy data for illustration purposes, in ascending order by date
  val tableComment = ((1 to 100) map { blogId =>
    blogId.toString -> List(Comment(UUID.randomUUID.toString, blogId.toString, "fred",
      DateTime.now.minusDays(blogId - 1), s"Comment for Blog ${blogId}",
      s"It is a very good blog post!")
    )
  }).toMap

  def receive: Receive = process(tableComment)

  def process(tableComment: Map[String, Seq[Comment]]): Receive = {
    case GetEntity(blogId, commentId) =>
      sender ! tableComment(blogId).find(_.id == commentId.toString)
    case ListWithOffset(Comment, Seq(blogId: String), offset, limit) =>
      if (tableComment contains blogId) {
        sender ! EntityList(tableComment(blogId).drop(offset).take(limit))
      } else {
        sender ! EntityList(IndexedSeq.empty[Comment])
      }
    case AddEntity(comment: Comment, ids @ _*) =>
      val blogId = ids.head
      if (tableComment contains blogId) {
        val comments = tableComment(blogId)
        context.become(process(tableComment + (blogId -> (comment +: comments))))
      } else {
        context.become(process(tableComment + (blogId -> IndexedSeq(comment))))
      }
      sender ! comment
    case DeleteEntity(blogId, commentId) =>
      val entity = tableComment(blogId).find(_.id == commentId)
      val comments = tableComment(blogId).filterNot(_.id == commentId)
      context.become(process(tableComment + (blogId -> comments)))
      sender ! entity
  }
}

object ModelComment {
  def props(mode: Option[String]) = Props(new ModelComment(mode))
  def name = "modelComment"
}
