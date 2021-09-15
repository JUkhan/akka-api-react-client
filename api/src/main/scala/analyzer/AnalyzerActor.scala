package analyzer

import akka.actor.{Actor, ActorLogging}
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import scala.io.Source
import spray.json._


case object FileSize
case object Status
case class InitAnalyzer(fileName:String)
case class Filter(dateTimeForm : LocalDateTime, dateTimeUntil: LocalDateTime, phrase: String)
case class Histogram(dateTimeForm : LocalDateTime, dateTimeUntil: LocalDateTime, phrase: String)
case class FilteredData(datetime: LocalDateTime, message:String)
case class HistogramData(datetime: LocalDateTime, counts:Int)
case class FileLength(size:Int)
case class StatusOk(status: String)

trait JsonSupport extends DefaultJsonProtocol  {
  implicit object LocalDateTimeJsonFormat extends RootJsonFormat[LocalDateTime] {
    override def write(dt: LocalDateTime) =
      JsString(dt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))

    override def read(json: JsValue): LocalDateTime = json match {
      case JsString(s) => LocalDateTime.parse(s, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
      case _ => throw new DeserializationException("Decode local datetime failed")
    }
  }
  implicit val dataFormat=jsonFormat2(FilteredData)
  implicit val statusFormat=jsonFormat1(StatusOk)
  implicit val sizeFormat=jsonFormat1(FileLength)
  implicit val filterFormat=jsonFormat3(Filter)
  implicit val histogramFormat=jsonFormat3(Histogram)
  implicit val histDataFormat=jsonFormat2(HistogramData)
}

class AnalyzerActor extends Actor with ActorLogging{

  override def receive: Receive = {
    case InitAnalyzer(fileName)=>
      log.info(s"Analyzing on $fileName")
      context.become(startAnalyzing(fileName))
  }
  def startAnalyzing(fileName: String):Receive={
    case Status=>
      sender() ! StatusOk("ok")
    case FileSize=>
      val size = Source.fromFile(fileName).size
      sender() ! FileLength(size)
    case Filter(dtFrom, dtUntil, phrase)=>
      val data= getFilteredData(fileName, dtFrom,dtUntil, phrase.toLowerCase())
      sender() ! data
    case Histogram(dtFrom, dtUntil, phrase)=>
      val filteredData= getFilteredData(fileName, dtFrom,dtUntil, phrase.toLowerCase())
      val histogramData=filteredData.groupBy(_.datetime).mapValues(_.size).map(a =>HistogramData(a._1, a._2))
      sender() ! histogramData
  }
  protected def getFilteredData(fileName:String, dtFrom:LocalDateTime, dtUntil:LocalDateTime, phrase:String):List[FilteredData]={
    log.info(s"from: $dtFrom, until: $dtUntil, phrase: $phrase")
    val formatter = DateTimeFormatter.ofPattern("[yyyy MMM dd kk:mm:ss][yyyy MMM  d kk:mm:ss]")
    val dateTime_pattern="[JFMASOND][a-z]{2}\\s+\\d?\\d\\s\\d{2}:\\d{2}:\\d{2}"
    var data:List[FilteredData] = List()
    val lDate=LocalDateTime.now()
    val adtFrom=dtFrom.withYear(lDate.getYear).withSecond(dtFrom.getSecond-1)
    val adtUntil=dtUntil.withYear(lDate.getYear).withSecond(dtUntil.getSecond+1)
    for (line <- Source.fromFile(fileName).getLines){
      if(line.toLowerCase().indexOf(phrase)>=0){
        val dts=line.substring(0,15) //.replaceAll("\\s{2}(\\d)"," 0$1")
        if(dts.matches(dateTime_pattern)){
          val dt=LocalDateTime.parse(s"${lDate.getYear} "+dts, formatter)
          if(dt.isAfter(adtFrom) && dt.isBefore(adtUntil)) {
            val message = line.substring(16)
            data = FilteredData(dt, message) :: data
          }
        }
      }
    }
    data
  }

}
