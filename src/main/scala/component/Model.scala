package component

import core._

import akka.actor.{Actor, Props}
import java.util.UUID
import org.joda.time.DateTime
import scala.collection.immutable.Map

case class GetEntity[T](ids: String*)
case class ListWithOffset(t: Any, params: Seq[Any], offset: Int, limit: Int)
case class EntityList[T](slice: Iterable[T])
case class AddEntity[T](blog: T, ids: String*)
case class DeleteEntity(ids: String*)

class Model(val mode: Option[String]) extends Actor {
    // Dummy data for illustration purposes, in ascending order by date
    val tableBlog = (for {
        x <- 1 to 100
    } yield Blog(UUID.randomUUID.toString, "jim", new DateTime().minusDays(101-x),
        s"Title ${x}", s"Description ${x}. Mode: ${mode}")).reverse

    val tableComment = (tableBlog.map { blog =>
        blog.id -> List(Comment(UUID.randomUUID.toString, blog.id, "fred",
            blog.date.plusDays(1), s"Comment for ${blog.title}",
            s"It is a very good blog post!")
        )
    }).toMap

    def receive: Receive = process(tableBlog, tableComment)

    def process(tableBlog: IndexedSeq[Blog], tableComment: Map[String, Seq[Comment]]): Receive = {
        case GetEntity(uuid) =>
            sender ! tableBlog.find(_.id == uuid.toString)
        case ListWithOffset(Blog, _, offset, limit) =>
            sender ! EntityList(tableBlog.drop(offset).take(limit))
        case AddEntity(blog: Blog, _*) =>
            val newTableBlog = tableBlog.filterNot(_.id == blog.id)
            context.become(process(blog +: newTableBlog, tableComment))
            sender ! blog
        case DeleteEntity(id) =>
            val entity = tableBlog.find(_.id == id)
            context.become(process(tableBlog.filterNot(_.id == id), tableComment))
            sender ! entity

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
                context.become(process(tableBlog, tableComment + (blogId -> (comment +: comments))))
            } else {
                context.become(process(tableBlog, tableComment + (blogId -> IndexedSeq(comment))))
            }
            sender ! comment
        case DeleteEntity(blogId, commentId) =>
            val entity = tableComment(blogId).find(_.id == commentId)
            val comments = tableComment(blogId).filterNot(_.id == commentId)
            context.become(process(tableBlog, tableComment + (blogId -> comments)))
            sender ! entity
    }
}

object Model {
    def props(mode: Option[String]) = Props(new Model(mode))
    def name = "model"
}
// vim: set ts=4 sw=4 et:
