package component

import akka.actor.{Actor, ActorLogging, ActorRef, ActorSystem, Props}
import akka.http.scaladsl.server.Directives._
import akka.pattern.ask
import akka.util.Timeout
import scala.concurrent.duration._

import core._

class SupervisorActor(val config: Config) extends Actor with ActorLogging {
  import context.dispatcher
  implicit val timeout = Timeout(3.seconds)

  val tickActor = config.router map {
    _ => context.actorOf(TickActor.props(config), TickActor.name)
  }

  val modelBlog = ModelBlog(config.mode)
  val modelComment = ModelComment(config.mode)
  val modelUser = ModelUser(config.mode)
  val modelToken = ModelToken(config.mode)

  val blogServiceActor = BlogService("blogs")
  blogServiceActor ! UseModel(Some(modelBlog))

  val userServiceActor = UserService("users")
  userServiceActor ! UseModel(Some(modelUser))

  val service = Service(config,
    List(blogServiceActor, userServiceActor),
    List(BlogDirectives.blogLinks, UserDirectives.userMenuLinks))

  def receive = {
    case msg => log.warning("Unknown message: {}", msg)
  }
}

object Supervisor {
  var actorSystem: ActorSystem = null

  def apply(systemName: String, config: Config) = {
    actorSystem = ActorSystem(systemName)
    val props = Props(new SupervisorActor(config))
    actorSystem.actorOf(props, name)
  }

  def name = "supervisor"

  def getChild(childName: String) = actorSystem.actorSelection(s"/user/$name/$childName")
}

