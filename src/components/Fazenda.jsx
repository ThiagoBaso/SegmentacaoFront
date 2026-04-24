import { useState, useEffect } from "react";
import "../styles/FazendaSidebar.scss";
import MapaFazenda from './MapaFazenda';
import { useApi } from '../services/useApi';
import "leaflet/dist/leaflet.css";
import MapToolbar from "./MapToolbar";

const API_URL = import.meta.env.VITE_API_URL;

export default function Fazenda() {
  const [imagemUrl, setImagemUrl] = useState();

  const segmentacao = useApi();
  const { uploadImagem } = segmentacao;


const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const dados = await uploadImagem(file);
    if (!dados) return;

    setImagemUrl(`${API_URL}/imagem/${dados.session_id}`);
};

  if (!imagemUrl) {
    return (
      <div className="fazenda-app">
        <div className="detail-panel detail-panel--empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <span>Selecione uma Fazenda</span>
          <div className="detail-panel__empty-action">
            <label htmlFor="arquivo" className="btn-nova-fazenda">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nova Fazenda
            </label>

            <input
              id="arquivo"
              type="file"
              accept="image/*"
              onChange={handleChange}
              style={{ display: "none" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wp">
      <div className="fazenda-app-w">
        <MapaFazenda imagemUrl={imagemUrl} {...segmentacao} />
      </div>
      <div className="lateralBar">
        
      </div>
    </div>
  );
}
