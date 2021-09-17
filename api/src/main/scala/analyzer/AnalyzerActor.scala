package analyzer

import akka.actor.{Actor, ActorLogging}

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import scala.io.Source
import spray.json._

import scala.collection.mutable.ListBuffer

// actor events
case object FileSize
case object Status
case class InitAnalyzer(fileName:String)
case class Filter(dateTimeFrom : LocalDateTime, dateTimeUntil: LocalDateTime, phrase: String)
case class Histogram(dateTimeFrom : LocalDateTime, dateTimeUntil: LocalDateTime, phrase: String)

//actor response
case class FilteredData(datetime: LocalDateTime, message:String)
case class FilteredDataHighlightText(datetime: LocalDateTime, message:String, highlightText: List[Position])
case class HistogramData(datetime: LocalDateTime, counts:Int)
case class FileLength(size:Int)
case class StatusOk(status: String)
case class Position(fromPosition:Int, toPosition:Int)
case class FilterResponse(data:List[FilteredDataHighlightText],  dateTimeFrom : LocalDateTime, dateTimeUntil: LocalDateTime, phrase: String)
case class HistogramResponse(histogram:List[HistogramData],  dateTimeFrom : LocalDateTime, dateTimeUntil: LocalDateTime, phrase: String)

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
  implicit val positionFormat = jsonFormat2(Position)
  implicit val highlightTextFormat=jsonFormat3(FilteredDataHighlightText)
  implicit val histogramResponse=jsonFormat4(HistogramResponse)
  implicit val dataResponse=jsonFormat4(FilterResponse)
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
        .map(it=>FilteredDataHighlightText(it.datetime, it.message, findPositions(it.message.toLowerCase(), phrase.toLowerCase()))).toList
      sender() ! FilterResponse(data, dtFrom, dtUntil, phrase)
    case Histogram(dtFrom, dtUntil, phrase)=>
      val filteredData= getFilteredData(fileName, dtFrom,dtUntil, phrase.toLowerCase())
      val histogramData=filteredData.groupBy(_.datetime).mapValues(_.size).map(a =>HistogramData(a._1, a._2)).toList
      sender() ! HistogramResponse(histogramData, dtFrom, dtUntil, phrase)
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

  protected def findPositions(str:String, subStr:String):List[Position]={
    if (subStr.size==0)return List()
    val res:ListBuffer[Position]=ListBuffer()
    val strLen=str.size
    val tempLen=subStr.size
    var fromIndex=0
    while (fromIndex+tempLen < strLen){
      val index =str.indexOf(subStr, fromIndex)
      if(index<0) return res.toList
      res += Position(index, index + tempLen - 1)
      fromIndex =index+tempLen
    }
    res.toList
  }
}
