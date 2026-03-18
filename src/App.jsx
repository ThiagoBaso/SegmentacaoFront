import { useState, useEffect, useRef } from 'react'
import './App.css'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import talhoes from "/fazenda_talhoes.json";

const API_URL = "http://localhost:8000"

function App() {
  const [imagemUrl, setImagemUrl] = useState(null);

  const [sessionId, setSessionId] = useState(null)
  const [talhoes, setTalhoes] = useState([])      // talhões confirmados
  const [preview, setPreview] = useState(null)    // contorno em andamento
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const ws = useRef(null)

  // Limpa WebSocket ao desmontar
  useEffect(() => {
    return () => encerrarSessao()
  }, [])

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagemUrl(URL.createObjectURL(file));
    uploadImagem(file)
  };



async function uploadImagem(arquivo) {
    setCarregando(true)
    setErro(null)

    const form = new FormData()
    form.append("arquivo", arquivo)

    const res  = await fetch(`${API_URL}/upload`, { method: "POST", body: form })
    const dados = await res.json()

    if (!res.ok) {
      setErro(dados.detail)
      setCarregando(false)
      return null
    }

    setSessionId(dados.session_id)
    setCarregando(false)

    // Abre WebSocket logo após o upload
    //abrirWebSocket(dados.session_id)

    console.log(dados)

    return dados   // { session_id, largura, altura }
  }

  async function encerrarSessao() {
    // if (ws.current) ws.current.close()
    // if (sessionId) {
    //   await fetch(`${API_URL}/sessao/${sessionId}`, { method: "DELETE" })
    // }
  }


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
      // talhoes.forEach((talhao) => {
      //   // Leaflet usa [lat, lng] == [y, x], por isso inverte [x, y] → [y, x]
      //   const pontos = talhao.pontos.map(([x, y]) => [img.height - y, x]);

      //   L.polygon(pontos, { color: "green", weight: 2 })
      //     .addTo(map)
      //     .bindPopup(`Talhão ${talhao.id} — ${talhao.area_pixels} px²`);
      // });
    };

    img.src = imagemUrl;
  }, [imagemUrl]);

  return (
    <div ref={mapRef} style={{ width: "100%", height: "500px" }} />
  );
}


export default App