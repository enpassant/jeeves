package component

import akka.actor.{ActorLogging, Actor, ActorRef, Props}

import core._

class Supervisor(val config: Config) extends Actor with ActorLogging {
  import context.dispatcher

  val tickActor = config.router map {
    _ => context.actorOf(TickActor.props(config), TickActor.name)
  }
  tickActor.map(_ ! Tick)

  val modelBlog = context.actorOf(ModelBlog.props(config.mode), ModelBlog.name)
  val modelComment = context.actorOf(ModelComment.props(config.mode), ModelComment.name)
  val modelToken = context.actorOf(ModelToken.props(config.mode), ModelToken.name)
  val service = context.actorOf(Service.props(config, tickActor.isDefined), Service.name)

  def receive = {
    case _ =>
  }
}

object Supervisor {
  def props(config: Config) = Props(new Supervisor(config))
  def name = "supervisor"
}

