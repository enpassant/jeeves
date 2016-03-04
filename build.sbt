name := """james"""

version := "1.0"

scalaVersion := "2.11.7"

resolvers += "spray repo" at "http://repo.spray.io"

val sprayVersion = "1.3.1"

val akkaVersion = "2.4.2-RC3"

ivyScala := ivyScala.value map { _.copy(overrideScalaVersion = true) }

Revolver.settings

//resolvers += "Sonatype snapshots" at "http://oss.sonatype.org/content/repositories/snapshots/"

resolvers += Resolver.sonatypeRepo("public")

libraryDependencies ++= Seq(
  "com.github.scopt"       %% "scopt"                   % "3.3.0",
  "com.typesafe.akka"      %% "akka-actor"              % akkaVersion,
  "com.typesafe.akka"      %% "akka-http-experimental"  % akkaVersion,
  "com.github.nscala-time" %% "nscala-time"             % "1.8.0",
  "com.github.ancane"      %% "haldr"                   % "0.1",
  "org.json4s"             %% "json4s-jackson"          % "3.2.10",
  "org.json4s"             %% "json4s-ext"              % "3.2.10",
  "org.webjars"             % "requirejs"               % "2.1.22",
  "org.webjars"             % "Semantic-UI"             % "2.1.8",
  "org.webjars"             % "mithril"                 % "0.2.3",
  "org.webjars"             % "jquery"                  % "2.2.1",
  "io.spray"               %% "spray-testkit"           % sprayVersion   % "test"
)

scalacOptions ++= Seq(
  "-unchecked",
  "-deprecation",
  "-Xlint",
  "-Ywarn-dead-code",
  "-language:_",
  "-target:jvm-1.7",
  "-encoding", "UTF-8"
)

//parallelExecution in Test := false

//fork in run := true

//connectInput in run := true

//outputStrategy in run := Some(StdoutOutput)

lazy val dev = config("dev") describedAs("dev environment settings")
lazy val prod = config("prod") describedAs("prod environment settings")

lazy val prodSettings = Seq(
    RjsKeys.mainModule := "build",
    RjsKeys.optimize := "ugilfy2"
)

lazy val root = (project.in(file("."))).enablePlugins(SbtWeb).configs(dev, prod).settings(
    inConfig(prod)(prodSettings): _*)

(managedClasspath in Runtime) += (packageBin in Assets).value

WebKeys.packagePrefix in Assets := "public/"

//unmanagedResourceDirectories in Compile += (WebKeys.public in Assets).value

//RjsKeys.mainModule := "build"

//RjsKeys.optimize := "none"

pipelineStages := Seq(rjs)

