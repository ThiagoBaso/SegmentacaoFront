import { useState, useEffect, useRef } from 'react'
import './App.css'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapaFazenda from './components/MapaFazenda';
import { useApi } from './services/useApi';

const API_URL = "http://localhost:8000"

function App() {
  const [imagemUrl, setImagemUrl] = useState(null);

  const {
    talhoes, preview, carregando, erro,
    uploadImagem, clicarPonto, confirmarTalhao, desfazer
  } = useApi()

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagemUrl(URL.createObjectURL(file));
    uploadImagem(file)
  };

  return (
    <div className='main'>
      <input type="file" accept="image/*" onChange={handleChange} />
      <MapaFazenda imagemUrl={imagemUrl} clicarPonto ={clicarPonto}/>
    </div>
  )
}



export default App