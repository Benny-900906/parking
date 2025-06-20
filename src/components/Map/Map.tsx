import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapCenterButton, MapSettingButton, MapUserLocationButton } from './MapButtons';
import { usePositionStore } from '../../stores/usePositionStore';
import { ParkingSpot } from '../../interfaces';
import { ParkingSpotMarker, UserMarker } from './Marker';

export const Map = ({ availableParkingSpots } : { availableParkingSpots? : Array<ParkingSpot> }) => {
  const { userPosition, setUserPosition } = usePositionStore();
  const hasInitialized = useRef<boolean>(false);

  const MapInit = () => {
    const map = useMap();
    // on mount: ask for user's init geolocation
    // only once, but since map.setView can only be used inside a Map Wrapper, put this logic inside a null- Function Component
    // and use ref to allow one-time execution on mount only
    useEffect(() => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserPosition({lat: latitude, lon: longitude});

          map.setView([latitude, longitude], map.getZoom())
        },
        (err) => {
          console.warn('Could not get geolocation, using default.');
        }
      );

    }, [])

    return null;
  }

  const DoubleTapMarkerControl = () => {
    useMapEvents({
      dblclick(e) {
        setUserPosition({lat: e.latlng.lat, lon: e.latlng.lng});
      }
    });

    return null;
  }
  
  useEffect(() => {
    console.log(userPosition);
  }, [userPosition])
 
  return (
    <div className="w-full flex justify-center"> 
      <MapContainer center={[userPosition.lat, userPosition.lon]} scrollWheelZoom={true} zoomControl={false} zoom={18} minZoom={12} doubleClickZoom={false} style={{ height: '100vh', width: '100%' }}>
        <MapInit />
        <DoubleTapMarkerControl />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <UserMarker />
        {
          availableParkingSpots?.map((spot, index) => (
            <ParkingSpotMarker index={index} key={index} spot={spot} />
          ))
        }
        <div className="flex flex-col gap-2 absolute right-4 top-6 z-[998]">
          <MapUserLocationButton />
          <MapCenterButton position={[userPosition.lat, userPosition.lon]} />
        </div>     

        <div className="absolute left-4 top-6 z-[998]">
          <MapSettingButton />
        </div>   
      </MapContainer>
    </div> 
  );
}