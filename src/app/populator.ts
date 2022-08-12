import { map, Observable, of, tap } from "rxjs";
import { People, Project } from "./models";
import { ProductiveService } from "./productive.service";

export type PopulationCache = { [type: string]: { [id: string]: any } };
export type PopulatableModel = { relationships: { [name: string]: { data: { type: string, id: string } } } };

export class Populator {
    private _adapters: { [key: string]: CachedPopulationAdapterBase<any> } = {};

    constructor(protected _productiveService: ProductiveService, private _cache: PopulationCache = {}) {
        this._adapters['projects'] = new ProjectPopulationAdapter(this._productiveService);
    }

    public populate(model: PopulatableModel): Observable<any> {
        const relationShipData = Object.keys(model.relationships).map(typeName => model.relationships[typeName].data);

        for (const relationShip of relationShipData) {
            if (!(relationShip.type in this._adapters)) continue;

            const adapter: CachedPopulationAdapterBase<any> = this._adapters[relationShip.type];

            return adapter.populateWithCache(relationShip.id, this._cache);
        }

        return of([]);
    }
}

export abstract class PopulationAdapterBase<T> {

    constructor(protected _productiveService: ProductiveService) { }

    public abstract get type(): string;
    public abstract populate(id: string): Observable<T>;
}

export abstract class CachedPopulationAdapterBase<T> extends PopulationAdapterBase<T> {

    public populateWithCache(id: string, cache: PopulationCache): Observable<T> {
        try {
            const cachedValue = cache[this.type][id];
            return of(cachedValue);
        } catch {
            const resultObservable = this.populate(id);
            return this._cacheResultPipe(resultObservable, id, cache);
        }
    }

    private _cacheResultPipe(observable: Observable<T>, id: string, cache: PopulationCache): Observable<T> {
        return observable.pipe(
            tap((result: T) => {
                if (!(this.type in cache)) {
                    cache[this.type] = {};
                }
                cache[this.type][id] = result;
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
            map((result: any) => ({id, name: result.data.attributes.name} as Project))
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
            map((result: any) => ({id, name: result.data.attributes.name} as People))
        );
    }
}
