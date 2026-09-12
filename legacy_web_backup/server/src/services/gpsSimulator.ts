import { query } from '../db';
import { broadcastGPSLocation, broadcastTankerUpdate } from './socketService';
import { v4 as uuidv4 } from 'uuid';

let simulatorInterval: NodeJS.Timeout | null = null;

// Route step counters for smooth progression
const tankerStepIndices: Record<string, number> = {};

export function startGpsSimulator(): void {
  if (simulatorInterval) return;

  console.log('🛰️ Starting Real-time GPS & Telematics Simulator (3-second pulse)...');

  simulatorInterval = setInterval(async () => {
    try {
      // Find all tankers in transit or active
      const activeTankers = await query(`
        SELECT t.*, o.id as active_order_id, o.latitude as dest_lat, o.longitude as dest_lng
        FROM tankers t
        LEFT JOIN orders o ON o.tanker_id = t.id AND o.status IN ('IN_TRANSIT', 'DISPENSING')
        WHERE t.status IN ('IN_TRANSIT', 'RETURNING_TO_DEPOT', 'AVAILABLE', 'ASSIGNED')
      `);

      for (const tanker of activeTankers.rows) {
        let lat = parseFloat(tanker.latitude);
        let lng = parseFloat(tanker.longitude);
        let speed = parseFloat(tanker.speed_kmh || '0');
        let temp = parseFloat(tanker.tank_temp_c || '24.2');
        let eta = tanker.eta_minutes || 0;

        if (tanker.status === 'IN_TRANSIT' && tanker.dest_lat && tanker.dest_lng) {
          const destLat = parseFloat(tanker.dest_lat);
          const destLng = parseFloat(tanker.dest_lng);

          // Step 5% towards destination per tick
          const dLat = (destLat - lat) * 0.08;
          const dLng = (destLng - lng) * 0.08;

          lat += dLat;
          lng += dLng;
          speed = Math.floor(38 + Math.random() * 15); // 38-53 km/h
          temp = +(23.8 + Math.random() * 1.2).toFixed(2);
          eta = Math.max(1, Math.round(eta - 0.2));

          const heading = Math.atan2(dLng, dLat) * (180 / Math.PI);

          // Update tanker record
          await query(`
            UPDATE tankers 
            SET latitude = $1, longitude = $2, speed_kmh = $3, tank_temp_c = $4, eta_minutes = $5
            WHERE id = $6
          `, [lat, lng, speed, temp, eta, tanker.id]);

          // Record in GPS history
          const gpsId = `gps-${uuidv4().substring(0, 8)}`;
          await query(`
            INSERT INTO gps_locations (id, tanker_id, order_id, latitude, longitude, speed_kmh, heading_deg)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [gpsId, tanker.id, tanker.active_order_id, lat, lng, speed, heading]);

          broadcastGPSLocation({
            tanker_id: tanker.id,
            latitude: lat,
            longitude: lng,
            speed_kmh: speed,
            heading_deg: heading,
            order_id: tanker.active_order_id
          });
        } else {
          // Subtle GPS noise/jitter for realistic radar display
          const jitterLat = (Math.random() - 0.5) * 0.0001;
          const jitterLng = (Math.random() - 0.5) * 0.0001;
          const newLat = lat + jitterLat;
          const newLng = lng + jitterLng;
          const ambientTemp = +(24.0 + (Math.random() - 0.5) * 0.4).toFixed(2);

          await query(`
            UPDATE tankers
            SET latitude = $1, longitude = $2, tank_temp_c = $3
            WHERE id = $4
          `, [newLat, newLng, ambientTemp, tanker.id]);

          broadcastGPSLocation({
            tanker_id: tanker.id,
            latitude: newLat,
            longitude: newLng,
            speed_kmh: 0,
            heading_deg: 0,
            order_id: null
          });
        }
      }
    } catch (err) {
      console.error('Error during GPS simulation tick:', err);
    }
  }, 3000);
}

export function stopGpsSimulator(): void {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
}
