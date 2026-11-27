'use client';

import React, { useEffect, useRef, useState } from 'react';

let leafletLoadPromise = null;

function loadLeaflet() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoadPromise) return leafletLoadPromise;

  leafletLoadPromise = new Promise((resolve, reject) => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById('leaflet-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });

  return leafletLoadPromise;
}

export default function LiveFleetMap({ drivers = [], selectedDriver = null, onSelectDriver }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const hasFittedInitialRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !L || !containerRef.current || mapRef.current) return;

        const initialLat = selectedDriver?.currentLat || drivers[0]?.currentLat || 19.0760;
        const initialLng = selectedDriver?.currentLng || drivers[0]?.currentLng || 72.8777;

        const map = L.map(containerRef.current, {
          center: [initialLat, initialLng],
          zoom: selectedDriver ? 16 : 13,
          zoomControl: true,
        });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        mapRef.current = map;
        markersLayerRef.current = layerGroup;
        setMapReady(true);
      })
      .catch((err) => {
        console.error('Failed to load Leaflet map:', err);
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update markers whenever drivers or selectedDriver changes
  useEffect(() => {
    if (!mapReady || !window.L || !mapRef.current || !markersLayerRef.current) return;
    const L = window.L;
    const map = mapRef.current;
    const layer = markersLayerRef.current;

    layer.clearLayers();

    const validDrivers = (drivers || []).filter(
      (d) => Number.isFinite(Number(d.currentLat)) && Number.isFinite(Number(d.currentLng))
    );

    validDrivers.forEach((drv) => {
      const lat = Number(drv.currentLat);
      const lng = Number(drv.currentLng);
      const isSelected = selectedDriver?.id === drv.id;
      const isOnline = Boolean(drv.isOnline);

      const dotColor = isSelected ? '#EA580C' : isOnline ? '#10B981' : '#6B7280';
      const ringColor = isSelected ? 'rgba(234,88,12,0.3)' : isOnline ? 'rgba(16,185,129,0.25)' : 'rgba(107,114,128,0.2)';
      const size = isSelected ? 34 : 26;

      const icon = L.divIcon({
        className: 'naturale-driver-pin',
        html: `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);">
            <div style="background:${isSelected ? '#111827' : '#FFFFFF'};color:${isSelected ? '#FFFFFF' : '#111827'};padding:2px 7px;border-radius:999px;font-size:10.5px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:1.5px solid ${dotColor};margin-bottom:3px;">
              ${drv.name} (${Math.round(drv.speed || 0)} km/h)
            </div>
            <div style="width:${size}px;height:${size}px;border-radius:50%;background:${ringColor};display:flex;align-items:center;justify-content:center;">
              <div style="width:${size - 10}px;height:${size - 10}px;border-radius:50%;background:${dotColor};border:2.5px solid #FFFFFF;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(layer);
      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:170px;">
          <div style="font-weight:800;font-size:13px;color:#111827;margin-bottom:4px;">${drv.name}</div>
          <div style="font-size:11.5px;color:#4B5563;"><strong>Vehicle:</strong> ${drv.vehicleType || 'Bike'} (${drv.vehicleNumber || 'N/A'})</div>
          <div style="font-size:11.5px;color:#4B5563;"><strong>Status:</strong> ${isOnline ? '🟢 Online' : '⚪ Offline'}</div>
          <div style="font-size:11.5px;color:#4B5563;"><strong>Speed:</strong> ${Number(drv.speed || 0).toFixed(1)} km/h</div>
          <div style="font-size:11px;color:#6B7280;margin-top:4px;font-family:monospace;">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectDriver) onSelectDriver(drv);
      });

      if (isSelected) {
        marker.setZIndexOffset(1000);
      }
    });

    if (selectedDriver && Number.isFinite(Number(selectedDriver.currentLat)) && Number.isFinite(Number(selectedDriver.currentLng))) {
      const targetLat = Number(selectedDriver.currentLat);
      const targetLng = Number(selectedDriver.currentLng);
      const currentZoom = map.getZoom();
      map.setView([targetLat, targetLng], currentZoom < 15 ? 16 : currentZoom, { animate: true });
    } else if (!hasFittedInitialRef.current && validDrivers.length > 0) {
      hasFittedInitialRef.current = true;
      if (validDrivers.length === 1) {
        map.setView([Number(validDrivers[0].currentLat), Number(validDrivers[0].currentLng)], 15);
      } else {
        const bounds = L.latLngBounds(validDrivers.map((d) => [Number(d.currentLat), Number(d.currentLng)]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [mapReady, drivers, selectedDriver, onSelectDriver]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '420px',
        backgroundColor: '#F3F4F6',
        zIndex: 1,
      }}
    />
  );
}

