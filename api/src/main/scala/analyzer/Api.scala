package analyzer

import com.typesafe.config.ConfigFactory
import akka.actor.{ActorSystem, Props}
import akka.http.scaladsl.Http
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.pattern.ask
import akka.stream.ActorMaterializer
import akka.http.scaladsl.server.Directives._
import akka.util.Timeout
import scala.concurrent.duration._


object Api extends  App with JsonSupport with SprayJsonSupport  {
  val config = ConfigFactory.load()
  val port = config.getInt("port")
  val fileName= config.getString("filePath")

  implicit val system = ActorSystem("demoApi")
  implicit val materializer = ActorMaterializer()
  import system.dispatcher
  implicit val timeout = Timeout(2 seconds)

  val analyzer = system.actorOf(Props[AnalyzerActor], "Analyzer")
  analyzer ! InitAnalyzer(fileName)


  val cors = new CORSHandler {}
  val routes=cors.corsHandler(
    pathPrefix("api") {
      get(
        path("get_status") {
          val status = (analyzer ? Status).mapTo[StatusOk]
          complete(status)
        } ~
          path("get_size") {
            val size = (analyzer ? FileSize).mapTo[FileLength]
            complete(size)
          }
      ) ~
        post(

          (path("data") & entity(as[Filter])) { filter =>
            val data = (analyzer ? filter).mapTo[FilterResponse]
            complete(data)
          } ~
            (path("histogram") & entity(as[Histogram])) { histogram =>
              val data = (analyzer ? histogram).mapTo[HistogramResponse]
              complete(data)
            }

        )
    })

  Http().bindAndHandle(routes, "localhost", port)

  println(s"Server is up and running on port: $port")
}
