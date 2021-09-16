import { StateController, effect } from "ajwahjs";
import { tap, map, exhaustMap, delay, filter } from "rxjs/operators";
import { ajax } from "rxjs/ajax";
import { Observable } from "rxjs";
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
  onInit() {
    fetch("http://localhost:8080/api/data", {
      method: "POST",
      headers: {
        mode: "no-cors",
      },
      body: JSON.stringify({
        dateTimeForm: "2021-01-01T00:01:01",
        dateTimeUntil: "2021-12-30T23:58:58",
        phrase: "",
      }),
    })
      .then((res) => res.json())
      .then(console.log)
      .catch(console.error);
  }
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
      exhaustMap(() => this.loadMessagedata()),
      tap((data) => console.log(data)),
      tap((data) => this.emit({ data: data } as any))
    )
  );
  baseUrl = "http://localhost:8080/api/";
  private loadMessagedata(): Observable<Array<MessageData>> {
    return ajax.post(this.baseUrl + "data", this.searchFormData(), {
      "Content-Type": "application/json",
    }) as any;
  }
  private loadHistogramData() {
    return ajax.post(this.baseUrl + "histogram", this.searchFormData());
  }
  private searchFormData() {
    const data = this.state.search;
    data.dateTimeFrom += ":01";
    data.dateTimeUntil += ":58";
    return data;
  }
}
