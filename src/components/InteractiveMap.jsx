import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import '../styles/map.css';

const InteractiveMap = ({ 
  defaultMarkers = [], 
  showCrosshair = true,
  showPopups = true,
  onMarkerClick,
  onLocationSelect,
  selectionMode = false
}) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const crosshairRef = useRef(null);
  const markersRef = useRef([]);
  const panIntervalRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with a zoomed out view of the world
    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true
    }).setView([20, 0], 2);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    // Add click handler for location selection
    const handleMapClick = (e) => {
      if (selectionMode && onLocationSelect) {
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          name: 'New Location'
        });
      }
    };

    mapRef.current.on('click', handleMapClick);

    // Ensure map is properly sized
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [selectionMode, onLocationSelect]);

  // Handle crosshair and map panning
  useEffect(() => {
    if (!mapRef.current || !showCrosshair) return;

    // Create root element for crosshair overlay
    const crosshairElement = document.createElement('div');
    crosshairElement.className = 'crosshair-container';
    
    const verticalLine = document.createElement('div');
    verticalLine.className = 'crosshair-vertical';
    
    const horizontalLine = document.createElement('div');
    horizontalLine.className = 'crosshair-horizontal';
    
    const centerDot = document.createElement('div');
    centerDot.className = 'crosshair-center';
    
    crosshairElement.appendChild(verticalLine);
    crosshairElement.appendChild(horizontalLine);
    crosshairElement.appendChild(centerDot);
    
    crosshairRef.current = crosshairElement;

    const mapContainerElement = mapRef.current.getContainer();
    if (!mapContainerElement) return;

    mapContainerElement.appendChild(crosshairElement);
    mapContainerElement.classList.add('map-with-crosshair');

    const handlePanStop = () => {
      if (panIntervalRef.current) {
        clearInterval(panIntervalRef.current);
        panIntervalRef.current = null;
      }
    };

    const handleMouseMove = (e) => {
      const rect = mapContainerElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mousePositionRef.current = { x, y };

      // Update crosshair position
      verticalLine.style.left = `${x}px`;
      horizontalLine.style.top = `${y}px`;
      centerDot.style.left = `${x}px`;
      centerDot.style.top = `${y}px`;

      // Check if we need to start/stop panning
      handleAutoPanning(x, y, rect.width, rect.height);
    };

    // Force an initial positioning of the crosshair in the center
    const rect = mapContainerElement.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    verticalLine.style.left = `${centerX}px`;
    horizontalLine.style.top = `${centerY}px`;
    centerDot.style.left = `${centerX}px`;
    centerDot.style.top = `${centerY}px`;
    
    mousePositionRef.current = { x: centerX, y: centerY };

    const handleAutoPanning = (x, y, width, height) => {
      const edgeThreshold = 50; // Keep the same threshold
      const panSpeed = 3; // Reduced from 10 to 3 for smoother movement
      const updateInterval = 16; // ~60fps for smooth animation

      if (panIntervalRef.current) {
        clearInterval(panIntervalRef.current);
        panIntervalRef.current = null;
      }

      const panLeft = x < edgeThreshold;
      const panRight = x > width - edgeThreshold;
      const panUp = y < edgeThreshold;
      const panDown = y > height - edgeThreshold;

      if (panLeft || panRight || panUp || panDown) {
        panIntervalRef.current = setInterval(() => {
          const center = mapRef.current.getCenter();
          const zoom = mapRef.current.getZoom();
          
          // Adjust the multiplier based on zoom level for consistent speed
          const pixelsToLatLng = (pixels) => {
            return pixels * 0.00002 * Math.pow(2, (18 - zoom));
          };

          let lat = center.lat;
          let lng = center.lng;

          // Calculate distance from edge for smooth acceleration
          const getSpeedMultiplier = (position, threshold) => {
            const distance = Math.min(position, threshold);
            return (threshold - distance) / threshold; // 0 to 1 based on proximity to edge
          };

          if (panUp) {
            const multiplier = getSpeedMultiplier(y, edgeThreshold);
            lat += pixelsToLatLng(panSpeed * multiplier);
          }
          if (panDown) {
            const multiplier = getSpeedMultiplier(height - y, edgeThreshold);
            lat -= pixelsToLatLng(panSpeed * multiplier);
          }
          if (panLeft) {
            const multiplier = getSpeedMultiplier(x, edgeThreshold);
            lng -= pixelsToLatLng(panSpeed * multiplier);
          }
          if (panRight) {
            const multiplier = getSpeedMultiplier(width - x, edgeThreshold);
            lng += pixelsToLatLng(panSpeed * multiplier);
          }

          mapRef.current.panTo([lat, lng], { 
            animate: false,
            duration: 0 // Ensure smooth continuous movement
          });
        }, updateInterval);
      }
    };

    mapContainerElement.addEventListener('mousemove', handleMouseMove);
    mapContainerElement.addEventListener('mouseleave', handlePanStop);

    return () => {
      // Store reference to map before cleanup
      const map = mapRef.current;
      
      if (mapContainerElement) {
        mapContainerElement.removeEventListener('mousemove', handleMouseMove);
        mapContainerElement.removeEventListener('mouseleave', handlePanStop);
        mapContainerElement.classList.remove('map-with-crosshair');
      }
      
      if (crosshairRef.current) {
        crosshairRef.current.remove();
        crosshairRef.current = null;
      }
      
      if (panIntervalRef.current) {
        clearInterval(panIntervalRef.current);
        panIntervalRef.current = null;
      }
      
      // Only try to remove click handler if map still exists
      if (map && selectionMode && onLocationSelect) {
        map.off('click');
      }
    };
  }, [showCrosshair, selectionMode, onLocationSelect]);

  // Handle markers
  useEffect(() => {
    // Clean up previous markers
    markersRef.current.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    if (!mapRef.current) return;

    // Add new markers
    defaultMarkers.forEach(markerData => {
      // Create custom icon with improved positioning
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container">
            <div class="marker-pin"></div>
            ${markerData.name ? `<div class="marker-tooltip">${markerData.name}</div>` : ''}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      });

      // Create marker with custom icon
      const marker = L.marker([markerData.lat, markerData.lng], { 
        icon: customIcon,
        title: markerData.name || 'Location'
      });

      // Add popup if needed
      if (showPopups && markerData.name) {
        marker.bindPopup(`
          <div class="custom-popup-container">
            <strong>${markerData.name}</strong>
          </div>
        `);
      }

      // Add click handler
      if (onMarkerClick) {
        marker.on('click', () => {
          onMarkerClick(markerData);
        });
      }

      // Add to map
      marker.addTo(mapRef.current);
      markersRef.current.push(marker);
    });

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => {
        if (mapRef.current) {
          mapRef.current.removeLayer(marker);
        }
      });
      markersRef.current = [];
    };
  }, [defaultMarkers, showPopups, onMarkerClick, mapRef.current]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '100%', position: 'relative' }}
      className={showCrosshair ? 'map-with-crosshair' : ''}
    />
  );
};

InteractiveMap.propTypes = {
  defaultMarkers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      popupContent: PropTypes.string,
      name: PropTypes.string
    })
  ),
  showCrosshair: PropTypes.bool,
  showPopups: PropTypes.bool,
  onMarkerClick: PropTypes.func,
  onLocationSelect: PropTypes.func,
  selectionMode: PropTypes.bool
};

export default InteractiveMap;

























