package component

import akka.actor.{Actor, ActorLogging, ActorRef, ActorSystem, Props}
import akka.http.scaladsl.server.Directives._
import akka.pattern.ask
import akka.util.Timeout
import scala.concurrent.duration._

import core._

class Supervisor(val config: Config) extends Actor with ActorLogging {
  import context.dispatcher
  implicit val timeout = Timeout(3.seconds)

  val tickActor = config.router map {
    _ => context.actorOf(TickActor.props(config), TickActor.name)
  }

  val modelBlog = context.actorOf(ModelBlog.props(config.mode), ModelBlog.name)
  val modelComment = context.actorOf(ModelComment.props(config.mode), ModelComment.name)
  val modelUser = context.actorOf(ModelUser.props(config.mode), ModelUser.name)
  val modelToken = context.actorOf(ModelToken.props(config.mode), ModelToken.name)

  val blogServiceActorModel = BlogDirectives.blogService("blogs", modelBlog ? _)
  val userServiceActorModel = UserDirectives.userService("users", modelUser ? _)
  val service = context.actorOf(Service.props(config,
    List(blogServiceActorModel, userServiceActorModel),
    List(BlogDirectives.blogLinks, UserDirectives.userMenuLinks)),
    Service.name)

  def receive = {
    case _ =>
  }
}

object Supervisor {
  val actorSystem = ActorSystem("james")
  def props(config: Config) = Props(new Supervisor(config))
  def name = "supervisor"

  def getChild(childName: String) = actorSystem.actorSelection(s"/user/$name/$childName")
}

