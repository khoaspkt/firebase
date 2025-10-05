import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Sửa lỗi icon (giữ nguyên như cũ)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Component MapEventsHandler (giữ nguyên như cũ)
const MapEventsHandler = ({ onMapChange }) => {
    const map = useMap();
    useEffect(() => {
        map.on('zoomend moveend', onMapChange);
        return () => {
            map.off('zoomend moveend', onMapChange);
        };
    }, [map, onMapChange]);
    return null;
};

// Component Map chính đã được cập nhật
const Map = ({ projectId, projectCenter }) => { // <-- NHẬN PROP MỚI
    const [lines, setLines] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [mapInstance, setMapInstance] = useState(null);

    // Hàm updateLayers (giữ nguyên như cũ)
    const updateLayers = useCallback(async () => {
        if (!projectId || !mapInstance) return;

        const zoom = mapInstance.getZoom();
        const bounds = mapInstance.getBounds();

        let lineLodField = 'waypoints_lod2';
        if (zoom >= 12 && zoom < 17) lineLodField = 'waypoints_lod1';
        else if (zoom >= 17) lineLodField = 'waypoints_full';
        
        const linesQuery = query(collection(db, "lines"), where("projectId", "==", projectId));
        const linesSnapshot = await getDocs(linesQuery);
        const linesData = linesSnapshot.docs.map(doc => doc.data()[lineLodField]);
        setLines(linesData);

        if (zoom >= 17) {
            const waypointsQuery = query(collection(db, `projects/${projectId}/raw_waypoints`));
            const waypointsSnapshot = await getDocs(waypointsQuery);
            const markersData = [];
            waypointsSnapshot.forEach(doc => {
                const waypoint = doc.data();
                const latLng = [waypoint.location.latitude, waypoint.location.longitude];
                if (bounds.contains(latLng)) {
                    markersData.push({
                        id: doc.id,
                        position: latLng,
                        name: waypoint.name,
                        description: waypoint.description,
                        imageUrls: waypoint.imageUrls,
                    });
                }
            });
            setMarkers(markersData);
        } else {
            setMarkers([]);
        }
    }, [projectId, mapInstance]);

    // useEffect để cập nhật layer khi projectId thay đổi (giữ nguyên như cũ)
    useEffect(() => {
        setLines([]);
        setMarkers([]);
        updateLayers();
    }, [updateLayers]);

    // --- useEffect MỚI ĐỂ XỬ LÝ ZOOM ---
    useEffect(() => {
        // Chỉ bay khi có map và có tọa độ mới
        if (mapInstance && projectCenter) {
            // Bay đến tọa độ với mức zoom 17
            mapInstance.flyTo(projectCenter, 17, {
                animate: true,
                duration: 1.5 // Thời gian bay (giây)
            });
        }
    }, [projectCenter, mapInstance]); // Chạy lại mỗi khi projectCenter thay đổi
    // ------------------------------------

    return (
        <MapContainer
            center={[10.7769, 106.7009]}
            zoom={13}
            style={{ height: '100%', width: '100%', position: 'fixed' }}
            whenCreated={setMapInstance}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapEventsHandler onMapChange={updateLayers} />
            
            {lines.map((line, index) => (
                <Polyline key={index} positions={line} color="blue" />
            ))}
            {markers.map((marker) => (
                <Marker key={marker.id} position={marker.position}>
                    <Popup>
                        <b>{marker.name}</b><br />
                        {marker.description || ''}
                        {marker.imageUrls?.map((url, i) => (
                           <img key={i} src={url} alt={`img-${i}`} style={{width: '100%', marginTop: '10px', borderRadius: '4px'}} />
                        ))}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
