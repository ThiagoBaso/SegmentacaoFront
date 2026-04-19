import { useState, useEffect, useRef } from 'react'
import './styles/App.scss'
import "leaflet/dist/leaflet.css";
import MapaFazenda from './components/MapaFazenda';
import { useApi } from './services/useApi';
import Fazenda from './components/Fazenda';



function App() {
  //const [imagemUrl, setImagemUrl] = useState();

  // const {
  //   talhoes, preview, carregando, erro,
  //   uploadImagem, clicarPonto, confirmarTalhao, desfazer, reiniciar
  // } = useApi()

  // const handleChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) setImagemUrl(URL.createObjectURL(file));
  //   uploadImagem(file)
  // };

  return (
    <div>
      <Fazenda/>
    </div>
  )
}



export default App