import { useState, useEffect, useRef } from 'react'
import './App.css'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import talhoes from "/fazenda_talhoes.json"; 


function App() {
  const [imagemUrl, setImagemUrl] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagemUrl(URL.createObjectURL(file));
  };

  return (
    <div className='main'>
      <input type="file" accept="image/*" onChange={handleChange} />
      <MapaFazenda imagemUrl={imagemUrl} />
    </div>
  )
}

function MapaFazenda({ imagemUrl }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -3,
    });
    mapInstanceRef.current = map;
    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!imagemUrl || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const img = new Image();

    img.onload = () => {
      const bounds = [[0, 0], [img.height, img.width]];
      L.imageOverlay(imagemUrl, bounds).addTo(map);
      map.fitBounds(bounds);

      // Adiciona os polígonos de cada talhão
      talhoes.forEach((talhao) => {
        // Leaflet usa [lat, lng] == [y, x], por isso inverte [x, y] → [y, x]
        const pontos = talhao.pontos.map(([x, y]) => [img.height - y, x]);

        L.polygon(pontos, { color: "green", weight: 2 })
          .addTo(map)
          .bindPopup(`Talhão ${talhao.id} — ${talhao.area_pixels} px²`);
      });
    };

    img.src = imagemUrl;
  }, [imagemUrl]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: "500px" }} />
  );
}

export default App