import { useState, useEffect, useRef } from 'react'
import './App.scss'
import "leaflet/dist/leaflet.css";
import MapaFazenda from './components/MapaFazenda';
import { useApi } from './services/useApi';

function App() {
  const [imagemUrl, setImagemUrl] = useState();

  const {
    talhoes, preview, carregando, erro,
    uploadImagem, clicarPonto, confirmarTalhao, desfazer, reiniciar
  } = useApi()

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagemUrl(URL.createObjectURL(file));
    uploadImagem(file)
  };

  return (
    <div className='main'>

      <div className="leftbar">
        <label for="arquivo">Enviar arquivo</label>
        <input type="file" accept="image/*" name="arquivo" id="arquivo" onChange={handleChange} />
      </div>

        <MapaFazenda
        imagemUrl={imagemUrl} clicarPonto ={clicarPonto} 
        talhoes={talhoes} preview={preview} confirmarTalhao={confirmarTalhao}
        desfazer={desfazer} reiniciar={reiniciar} carregando={carregando}/>

      <div className="rigthbar">
        
      </div>

    </div>
  )
}



export default App