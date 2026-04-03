import { useState, useEffect, useRef } from 'react'
import './styles/App.scss'
import "leaflet/dist/leaflet.css";
import MapaFazenda from './components/MapaFazenda';
import { useApi } from './services/useApi';
import FazendaSidebar from './components/FazendaSidebar';

const MOCK_FAZENDAS = [
  {
    id: "faz_001",
    nome: "Fazenda Boa Vista",
    thumbnail: null,
    localizacao: { cidade: "Tupã", estado: "SP" },
    area_total_ha: 320.5,
    talhoes: [
      { id: "tal_001", nome: "Talhão A", area_ha: 85.2,  cor: "#00FFAA" },
      { id: "tal_002", nome: "Talhão B", area_ha: 112.0, cor: "#00AAFF" },
    ],
  },
  {
    id: "faz_002",
    nome: "Fazenda Santa Cruz",
    thumbnail: null,
    localizacao: { cidade: "Marília", estado: "SP" },
    area_total_ha: 540.0,
    talhoes: [
      { id: "tal_003", nome: "Talhão C", area_ha: 200.0, cor: "#FFD700" },
      { id: "tal_004", nome: "Talhão D", area_ha: 180.5, cor: "#FF6B35" },
      { id: "tal_005", nome: "Talhão E", area_ha: 159.5, cor: "#CC44FF" },
    ],
  },
  {
    id: "faz_003",
    nome: "Fazenda São Pedro",
    thumbnail: null,
    localizacao: { cidade: "Assis", estado: "SP" },
    area_total_ha: 210.0,
    talhoes: [
      { id: "tal_006", nome: "Talhão F", area_ha: 210.0, cor: "#44FFDD" },
    ],
  },
  {
    id: "faz_004",
    nome: "Fazenda Ipê",
    thumbnail: null,
    localizacao: { cidade: "Tupã", estado: "SP" },
    area_total_ha: 890.75,
    talhoes: [
      { id: "tal_007", nome: "Talhão G", area_ha: 445.0,  cor: "#FF4466" },
      { id: "tal_008", nome: "Talhão H", area_ha: 445.75, cor: "#88FF44" },
    ],
  },
];

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
    <div>
      <FazendaSidebar/>
    </div>
  )



//   return (
//     <div className='main'>

//       <div className="leftbar">
//         <div className="searchbar">
//           <input type="text" name="search" id="search"/>
//         </div>
//         <div className="fazendasList">AAAA</div>
//         <div className="fazendaNew">
//           <label for="arquivo">Enviar arquivo</label>
//           <input type="file" accept="image/*" name="arquivo" id="arquivo" onChange={handleChange} />
//         </div>
//       </div>

//         <MapaFazenda
//         imagemUrl={imagemUrl} clicarPonto ={clicarPonto} 
//         talhoes={talhoes} preview={preview} confirmarTalhao={confirmarTalhao}
//         desfazer={desfazer} reiniciar={reiniciar} carregando={carregando}/>

//       <div className="rigthbar">
        
//       </div>

//     </div>
//   )
}



export default App