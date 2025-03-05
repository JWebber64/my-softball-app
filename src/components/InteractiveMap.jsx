import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from '../lib/supabaseClient';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  useToast,
  Text,
} from "@chakra-ui/react";

// Add this CSS to override Leaflet's cursor styles
const mapStyles = `
  .leaflet-container,
  .leaflet-grab,
  .leaflet-interactive,
  .leaflet-dragging .leaflet-grab {
    cursor: none !important;
  }

  .leaflet-tile-pane {
    mix-blend-mode: multiply;
  }

  .leaflet-control-container {
    z-index: 1000;
  }
`;

const InteractiveMap = ({ onLocationSelect, selectedLocation, selectionMode = false }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const panIntervalRef = useRef(null);
  const markersRef = useRef({});
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const toast = useToast();

  // Constants
  const EDGE_THRESHOLD = 50;
  const BASE_PAN_SPEED = 2; // Increased base speed
  const PAN_INTERVAL = 16;

  // Load team locations
  useEffect(() => {
    const loadTeamLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('id, name, latitude, longitude, location_name')
          .not('latitude', 'is', null);

        if (error) throw error;

        setTeams(data);

        // Add markers for each team
        data.forEach(team => {
          if (mapRef.current && team.latitude && team.longitude) {
            const marker = L.marker([team.latitude, team.longitude])
              .addTo(mapRef.current)
              .bindPopup(team.name);
            markersRef.current[team.id] = marker;
          }
        });
      } catch (error) {
        console.error("Error loading team locations:", error);
        toast({
          title: "Error",
          description: "Failed to load team locations",
          status: "error",
          duration: 5000,
        });
      }
    };

    loadTeamLocations();

    return () => {
      // Cleanup markers
      Object.values(markersRef.current).forEach(marker => {
        marker.remove();
      });
      markersRef.current = {};
    };
  }, [toast]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });

    // Calculate distances to edges
    const distanceToRight = rect.width - x;
    const distanceToLeft = x;
    const distanceToTop = y;
    const distanceToBottom = rect.height - y;

    // Clear any existing pan interval
    if (panIntervalRef.current) {
      clearInterval(panIntervalRef.current);
      panIntervalRef.current = null;
    }

    // Simple pan direction determination
    let panX = 0;
    let panY = 0;

    if (distanceToRight < EDGE_THRESHOLD) panX = 1;
    else if (distanceToLeft < EDGE_THRESHOLD) panX = -1;
    if (distanceToBottom < EDGE_THRESHOLD) panY = 1;
    else if (distanceToTop < EDGE_THRESHOLD) panY = -1;

    // If we need to pan, start the interval
    if (panX !== 0 || panY !== 0) {
      panIntervalRef.current = setInterval(() => {
        if (mapRef.current) {
          const zoom = mapRef.current.getZoom();
          const center = mapRef.current.getCenter();
          
          // Adjust speed based on zoom level
          const zoomFactor = Math.pow(0.5, zoom - 2); // Exponential scaling
          const currentSpeed = BASE_PAN_SPEED * zoomFactor;
          
          const newLat = center.lat - (panY * currentSpeed);
          const newLng = center.lng + (panX * currentSpeed);

          mapRef.current.panTo([newLat, newLng], { animate: false });
        }
      }, PAN_INTERVAL);
    }
  };

  const handleMouseLeave = () => {
    if (panIntervalRef.current) {
      clearInterval(panIntervalRef.current);
      panIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        dragging: true,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      if (selectionMode) {
        mapRef.current.on('dblclick', async (e) => {
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${e.latlng.lat}+${e.latlng.lng}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`
            );
            const data = await response.json();
            
            const locationName = data.results?.[0]?.formatted || null;
            
            onLocationSelect({
              lat: e.latlng.lat,
              lng: e.latlng.lng,
              name: locationName
            });
          } catch (error) {
            console.error("Error getting location name:", error);
            onLocationSelect({
              lat: e.latlng.lat,
              lng: e.latlng.lng
            });
          }
        });
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Error",
        description: "Failed to initialize map",
        status: "error",
        duration: 5000,
      });
    }

    return () => {
      if (panIntervalRef.current) {
        clearInterval(panIntervalRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [toast, selectionMode, onLocationSelect]);

  return (
    <>
      <style>{mapStyles}</style>
      <div 
        className="relative"
        style={{ 
          cursor: "none", 
          position: "relative",
          height: "100%",
          width: "100%",
          overflow: "hidden"
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Crosshairs Container */}
        <div 
          style={{
            position: "absolute",
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 10000
          }}
        >
          {/* Vertical line - full height */}
          <div style={{
            position: "absolute",
            width: "1px",
            height: "2000px",
            backgroundColor: "#2e3726",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
          }} />
          
          {/* Horizontal line - full width */}
          <div style={{
            position: "absolute",
            width: "2000px",
            height: "1px",
            backgroundColor: "#2e3726",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
          }} />

          {/* Circle around center */}
          <div 
            style={{
              position: "absolute",
              width: "20px",
              height: "20px",
              border: "2px solid #2e3726",
              borderRadius: "50%",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "transparent"
            }}
          />

          {/* Center dot */}
          <div 
            style={{
              position: "absolute",
              width: "4px",
              height: "4px",
              backgroundColor: "#2e3726",
              borderRadius: "50%",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)"
            }}
          />
        </div>
        
        <div 
          ref={mapContainerRef} 
          style={{ 
            height: "100%", 
            width: "100%",
            position: "relative",
            zIndex: 1
          }}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Selected Location</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} pb={4}>
              {selectedLocation && (
                <Text>
                  Latitude: {selectedLocation.lat.toFixed(6)}
                  <br />
                  Longitude: {selectedLocation.lng.toFixed(6)}
                </Text>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default InteractiveMap;
