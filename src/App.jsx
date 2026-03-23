import { useState, useEffect, useRef } from 'react'
import './App.css'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import talhoes from "/fazenda_talhoes.json";
import MapaFazenda from './components/MapaFazenda';
import { uploadImagem, encerrarSessao } from './services/api'

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
    return () => encerrarSessao(sessionId,
      talhoes,
      preview,
      carregando,
      erro,)
  }, [])

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagemUrl(URL.createObjectURL(file));
    uploadImagem(file, setCarregando, setErro, setSessionId)
  };

  return (
    <div className='main'>
      <input type="file" accept="image/*" onChange={handleChange} />
      <MapaFazenda imagemUrl={imagemUrl} />
    </div>
  )
}



export default App