import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap, zip, zipAll } from 'rxjs';
import { CacheService } from './cache.service';
import { PopulatableModel, Populator } from './populator';

export type Task = {
  assigneeName: string;
  ticketId: string;
  title: string;
  shortDescription: string;
  tags: string[];
  projectName: string;
  remainingTime: number;
};

const credentials = {
  organizationId: '20054',
  token: '8720ec5a-87d2-486d-92fb-69e54a204d40',
};

@Injectable({
  providedIn: 'root'
})
export class ProductiveService {

  private _populator: Populator;

  constructor(private _http: HttpClient, private _cacheService: CacheService) {
    this._populator = new Populator(this);
  }

  public getTasks(filter?: string): Observable<any[]> {
      const endpoint = "tasks?" + filter;
      const response = this._http.get(this._baseUrl + endpoint, { headers: this._httpHeader }).pipe(map((response: any) => {
        return response.data;
      }));

      const request = this._populator.populateMultiple(response).pipe(
        map((tasks) => {
          const x = tasks.map((task: any) => ({
            assigneeName: task.populatedData.find((c: any) => c.type == 'assignee')?.name,
            projectName: task.populatedData.find((c: any) => c.type == 'project')?.name,
            shortDescription: task.attributes.description,
            tags: task.attributes.tags ?? [],
            ticketId: task.attributes.number,
            title: task.attributes.title,
            remainingTime: task.attributes.remaining_time,
          } as Task));
          return x;
        })
      );

      return this._cacheService.readOrFetch(endpoint, request, 90);
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
