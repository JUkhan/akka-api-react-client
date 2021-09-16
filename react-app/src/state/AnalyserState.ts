import { StateController, effect } from "ajwahjs";
import { tap, map, switchMap, delay, filter } from "rxjs/operators";
import { Observable, from } from "rxjs";
export type MessageData = {
  datetime: string;
  message: string;
};
export type SearchData = {
  dateTimeFrom: string;
  dateTimeUntil: string;
  phrase: string;
};
export interface IAnalyserState {
  search: SearchData;
  data: MessageData[];
  histogram: any;
}
type MessageFrequencies = {
  datetime: string;
  counts: number;
};
export class SearchAction {
  constructor(public payload: SearchData) {}
}
export class AnalyserState extends StateController<IAnalyserState> {
  constructor() {
    super({
      search: { dateTimeFrom: "", dateTimeUntil: "", phrase: "" },
      data: [],
      histogram: {},
    });
  }
  onInit() {}
  search = effect<SearchData>((data$) =>
    data$.pipe(
      filter(
        (data) =>
          data.dateTimeFrom !== this.state.search.dateTimeFrom ||
          data.dateTimeUntil !== this.state.search.dateTimeUntil ||
          data.phrase !== this.state.search.phrase
      ),
      tap((data) => this.emit({ search: data } as any)),
      tap((data) => console.log(data)),
      switchMap(() => this.loadMessageData()),
      tap((data) => this.emit({ data } as any)),
      //delay(1000),
      switchMap(() => this.loadHistogramData()),
      map(this.mapHistogramData),
      tap((data) => this.emit({ histogram: data } as any))
    )
  );
  baseUrl = "http://localhost:8080/api/";
  private loadMessageData(): Observable<Array<MessageData>> {
    return this.getData(this.baseUrl + "data");
  }
  private loadHistogramData() {
    return this.getData(this.baseUrl + "histogram");
  }
  private searchFormData() {
    const data = { ...this.state.search };
    data.dateTimeFrom += ":01";
    data.dateTimeUntil += ":58";
    return data;
  }
  private getData(url: string) {
    return from(
      fetch(url, {
        method: "POST",
        headers: {
          mode: "cors",
          credentials: "include",
          Accepts: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.searchFormData()),
      }).then((res) => res.json())
    );
  }
  private mapHistogramData(data: MessageFrequencies[]) {
    return data.reduce<any>(
      (acc, item) => {
        acc.labels.push(item.datetime);
        acc.datasets[0].data.push(item.counts);
        return acc;
      },
      {
        labels: [],
        datasets: [
          {
            label: "Message Frequency",
            data: [],
          },
        ],
      }
    );
  }
}
