import { Injectable } from "@angular/core";
import { Observable, of, tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CacheService {
    
    public cache: any = {};
    
    constructor() {
        this._readCacheFromLocalStorage();
    }

    public writeToCache(key: string, value: any, validForSeconds: number) {
        const validUntil = new Date();
        validUntil.setSeconds(validUntil.getSeconds() + validForSeconds);
        this.cache[key] = {value, validUntil: +validUntil};
    
        this._writeCacheToLocalStorage();
    }

    public readOrFetch(key: string, callback: Observable<any>, validForSeconds: number = 600): Observable<any> {
        
        const cachePipe = callback.pipe(
            tap((result: any) => {
                this.writeToCache(key, result, validForSeconds)
            }));

        if (!(key in this.cache)) return cachePipe;

        const value = this.cache[key];

        const currentDate = +new Date();

        if (currentDate >= +new Date(value.validUntil)) {
            return cachePipe;
        }

        return of(value.value);
    }

    private _readCacheFromLocalStorage(): any {
        this.cache = JSON.parse(localStorage.getItem('akCache') ?? '{}');
    }

    private _writeCacheToLocalStorage() {
        localStorage.setItem('akCache', JSON.stringify(this.cache));
    }
}