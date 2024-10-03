import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleMapsModule } from "@angular/google-maps";
import {Colored, DataService, Polygon} from "../data/data.service";
import proj4 from 'proj4';
import { latLngToCell, cellToBoundary } from 'h3-js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GoogleMapsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ng-hexagons';

  map: google.maps.Map | null | undefined;
  minLat = 34.83935041485015;
  minLng = 27.056368307916127;
  maxLat = 34.83935041485015;
  maxLng = 27.056368307916127;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.getData().subscribe({
      next: data => {
        this.initializeMap({ lat: this.minLat, lng: this.minLng });
        const { features } = data
        for (const feature of features) {
          const color = feature.properties.COLOR_HEX;
          const multiPolygons = feature.geometry.coordinates;
          for (const multiPolygon of multiPolygons) {
            for (const polygon of multiPolygon) {
              this.makePolygon(polygon, color);
            }
          }
        }
        const center = { lat: (this.maxLat + this.minLat) / 2, lng: (this.maxLng + this.minLng) / 2 };
        this.map.setCenter(center);
      },
      error: error => { console.error(error) },
    })
  }

  makePolygon(polygon: Polygon, color: string) {
    const polygonWGS84 = polygon.map(item=> proj4('EPSG:3785', 'EPSG:4326', item));
    const coords = polygonWGS84.map(([lat, lng]) => ({ lat, lng }));
    const h3indexes = coords.map(coord => latLngToCell(coord.lat, coord.lng, 5));
    const hexagons = h3indexes.map(h3 => cellToBoundary(h3)).map(hexagon => hexagon.map(([lat, lng]) => ({ lat, lng })));
    const bounds = hexagons[0][0];
    (bounds.lat < this.minLat) && (this.minLat = bounds.lat);
    (bounds.lng < this.minLng) && (this.minLng = bounds.lng);
    (bounds.lat > this.maxLat) && (this.maxLat = bounds.lat);
    (bounds.lng > this.maxLng) && (this.maxLng = bounds.lng);
    const hexagon = new google.maps.Polygon({
      paths: hexagons,
      strokeColor: '#777777',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: `#${color}`,
      fillOpacity: 0.35,
    });
    hexagon.setMap(this.map);
  }

  initializeMap(center: google.maps.LatLngLiteral): void {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      zoom: 8,
      center,
    });
  }
}
