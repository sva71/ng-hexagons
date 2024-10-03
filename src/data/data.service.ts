import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export type Coordinates = [number, number];
export type Polygon = Coordinates[];
export type MultiPolygon = Polygon[];

export type Colored<T> = {
  item: T;
  color: string;
}

export interface FeatureCollection {
  type: string;
  properties: {
    id: number;
    COLOR_HEX: string;
  }
  geometry: {
    type: string;
    crs: {
      type: string;
      properties: {
        name: string;
      }
    }
    coordinates: MultiPolygon[];
  }
}

export interface HexagonsData {
  type: string;
  features: FeatureCollection[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private url = 'assets/data.json';

  constructor(private http: HttpClient) { }

  getData(): Observable<HexagonsData> {
    return this.http.get<HexagonsData>(this.url);
  }
}
