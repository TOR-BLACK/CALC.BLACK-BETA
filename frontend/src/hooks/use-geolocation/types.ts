export interface UseGeolocationCoordsType {
  latitude: number;
  longitude: number;
  altitude: number | null;
}

export interface UseGeolocationPositionType {
  coords?: GeolocationCoordinates;
  timestamp: EpochTimeStamp;
}
