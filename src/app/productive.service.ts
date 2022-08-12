import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap, zip, zipAll } from 'rxjs';
import { PopulatableModel, Populator } from './populator';

export type Task = {
  assigneeName: string;
  ticketId: string;
  title: string;
  shortDescription: string;
  tags: string[];
  projectName: string;
};

const credentials = {
  organizationId: '',
  token: '',
};

@Injectable({
  providedIn: 'root'
})
export class ProductiveService {

  private _populator: Populator;

  constructor(private _http: HttpClient) {
    this._populator = new Populator(this);
  }

  public getTasks(): Observable<Task[]> {
    return this._http.get(this._baseUrl + "tasks", { headers: this._httpHeader })
      .pipe(
        map((response: any) => {
          return response.data;
        }),
        switchMap((result: any[]) => {
          // return result.map(c => ({...c, populatedData: this._populator.populate(c as PopulatableModel)}));
          return zip(result.map(c =>
          (this._populator.populate(c as PopulatableModel).pipe(
            map((populatedData: any) => {
              return { ...c, populatedData }
            }),
          )
          )));
        }),
        map((data: any) => {
          console.log(data);
          const result = data.map((c: any) => ({
            shortDescription: c.attributes.description.replace(/(?:\r\n|\r|\n)/g, '<br />'),
            title: c.attributes.title,
            ticketId: c.attributes.number,
            assigneeName: 'AP',
            projectName: c.populatedData.name,
          } as Task));

          return result;
        }),
      );
  }

  public getProject(id: string): Observable<any> {
    return this._http.get(this._baseUrl + 'projects/' + id, { headers: this._httpHeader });
  }

  public getAssignee(id: string): Observable<any> {
    return this._http.get(this._baseUrl + 'people/' + id, { headers: this._httpHeader });
  }

  private get _httpHeader(): any {
    return {
      'X-Auth-Token': credentials.token,
      'X-Organization-Id': credentials.organizationId,
      'Content-Type': 'application/vnd.api+json'
    };
  }

  private get _baseUrl(): string {
    return 'https://api.productive.io/api/v2/';
  }
}
