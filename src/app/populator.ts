import { map, Observable, of, switchMap, tap, zip } from "rxjs";
import { People, Project } from "./models";
import { ProductiveService } from "./productive.service";

export type PopulationCache = { [type: string]: { [id: string]: any } };
export type PopulatableModel = { relationships: { [name: string]: { data: { type: string, id: string } } }, populatedData: any[] };

export class Populator {
    private _adapters: { [key: string]: CachedPopulationAdapterBase<any> } = {};

    constructor(protected _productiveService: ProductiveService, private _cache: PopulationCache = {}) {
        this._adapters['project'] = new ProjectPopulationAdapter(this._productiveService);
        this._adapters['assignee'] = new PeoplePopulationAdapter(this._productiveService);
    }

    public populateMultiple(modelObservables: Observable<PopulatableModel[]>): Observable<any> {
        return modelObservables.pipe(
            switchMap((models: PopulatableModel[]) => {
                const observables = models.map(model => this.populate(of(model)));
                return zip(...observables);
            })
        )
    }

    public populate(modelObservable: Observable<PopulatableModel>): Observable<any> {
        return modelObservable.pipe(
            switchMap((model: PopulatableModel) => {
                
                const observables = [];
                
                const relationShipKeys = Object.keys(model.relationships);

                for (const relationShipKey of relationShipKeys) {
                    if (!(relationShipKey in this._adapters)) continue;

                    const relationShip = model.relationships[relationShipKey].data;
                    if (relationShip == null) continue;

                    const adapter: CachedPopulationAdapterBase<any> = this._adapters[relationShipKey];

                    observables.push(adapter.populateWithCache(relationShip.id, this._cache, relationShipKey));
                }

                return zip(observables).pipe(
                    map((populatedData: any[]) => {
                        model.populatedData = populatedData;
                        return model;
                    })
                );
            }),
        )
    }
}

export abstract class PopulationAdapterBase<T> {

    constructor(protected _productiveService: ProductiveService) { }

    public abstract get type(): string;
    public abstract populate(id: string): Observable<T>;
}

export abstract class CachedPopulationAdapterBase<T> extends PopulationAdapterBase<T> {

    public populateWithCache(id: string, cache: PopulationCache, type: string): Observable<T> {
        try {
            const cachedValue = cache[this.type][id];
            return of(cachedValue);
        } catch {
            const resultObservable = this.populate(id);
            return this._cacheResultPipe(resultObservable, id, cache, type);
        }
    }

    private _cacheResultPipe(observable: Observable<T>, id: string, cache: PopulationCache, type: string): Observable<T> {
        return observable.pipe(
            tap((result: T) => {
                if (!(this.type in cache)) {
                    cache[this.type] = {};
                }
                cache[this.type][id] = result;
            }),
            map((result: T) => {
                return {...result, type: type } as T;
            })
        );
    }
}

export class ProjectPopulationAdapter extends CachedPopulationAdapterBase<Project> {

    public get type(): string {
        return "project";
    }

    public override populate(id: string): Observable<Project> {
        return this._productiveService.getProject(id)
            .pipe(
                map((result: any) => ({ id, name: result.data.attributes.name } as Project))
            );
    }
}

export class PeoplePopulationAdapter extends CachedPopulationAdapterBase<People> {

    public get type(): string {
        return "people";
    }

    public override populate(id: string): Observable<People> {
        return this._productiveService.getAssignee(id)
            .pipe(
                map((result: any) => ({
                    id,
                    name: result.data.attributes.first_name + " " + result.data.attributes.last_name
                } as People))
            );
    }
}
