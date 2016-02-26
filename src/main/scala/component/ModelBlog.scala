package component

import core._

import akka.actor.{Actor, Props}
import java.util.UUID
import org.joda.time.DateTime
import scala.collection.immutable.Map

class ModelBlog(val mode: Option[String]) extends Actor {
    // Dummy data for illustration purposes, in ascending order by date
    val tableBlog = (for {
        x <- 1 to 100
    } yield Blog(x.toString, "jim", new DateTime().minusDays(101-x),
        s"Title ${x}", s"Description ${x}. Mode: ${mode}")).reverse

    def receive: Receive = process(tableBlog)

    def process(tableBlog: IndexedSeq[Blog]): Receive = {
        case GetEntity(uuid) =>
            sender ! tableBlog.find(_.id == uuid.toString)
        case ListWithOffset(Blog, _, offset, limit) =>
            sender ! EntityList(tableBlog.drop(offset).take(limit))
        case AddEntity(blog: Blog, _*) =>
            val newTableBlog = tableBlog.filterNot(_.id == blog.id)
            context.become(process(blog +: newTableBlog))
            sender ! blog
        case DeleteEntity(id) =>
            val entity = tableBlog.find(_.id == id)
            context.become(process(tableBlog.filterNot(_.id == id)))
            sender ! entity
    }
}

object ModelBlog {
    def props(mode: Option[String]) = Props(new ModelBlog(mode))
    def name = "modelBlog"
}
// vim: set ts=4 sw=4 et:
