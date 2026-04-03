import { useState, useEffect } from "react";
import "../styles/FazendaSidebar.scss";
import MapaFazenda from '../components/MapaFazenda';
import { useApi } from '../services/useApi';
import "leaflet/dist/leaflet.css";

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────

function FazendaCard({ fazenda, isSelected, onClick }) {
  return (
    <button
      className={`fazenda-card${isSelected ? " fazenda-card--selected" : ""}`}
      onClick={() => onClick(fazenda)}
    >
      {/* Thumbnail */}
      <div className="fazenda-card__thumbnail">
        {fazenda.talhoes.slice(0, 4).map((t) => (
          <div
            key={t.id}
            className="fazenda-card__talhao-block"
            style={{ background: t.cor }}
          />
        ))}
      </div>

      {/* Info */}
      <div className="fazenda-card__info">
        <div className="fazenda-card__nome">{fazenda.nome}</div>
        <div className="fazenda-card__meta">
          {fazenda.localizacao.cidade} · {fazenda.area_total_ha.toFixed(0)} ha
        </div>
        <div className="fazenda-card__strips">
          {fazenda.talhoes.map((t) => (
            <span
              key={t.id}
              className="fazenda-card__strip"
              style={{ background: t.cor }}
            />
          ))}
        </div>
      </div>

      {/* Chevron */}
      {isSelected && (
        <svg
          className="fazenda-card__chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
    </div>
  );
}

function DetailPanel({ fazenda, imagemUrl, segmentacao }) {

  if (!fazenda) {
    return (
      <div className="detail-panel detail-panel--empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        Selecione uma fazenda
      </div>
    );
  }

  return (
    <div className="detail-panel">
      <div className="detail-panel__content">
        <div className="detail-panel__label">Fazenda selecionada</div>
        <div className="detail-panel__nome">{fazenda.nome}</div>
        <div className="detail-panel__localizacao">
          {fazenda.localizacao.cidade}, {fazenda.localizacao.estado}
        </div>

        <div className="detail-panel__divider" />

        <div className="detail-panel__map">
          <MapaFazenda
            imagemUrl={imagemUrl}
            {...segmentacao}
          />
        </div>

        {segmentacao.erro && (
          <div className="detail-panel__error">{segmentacao.erro}</div>
        )}

        {/* <div className="detail-panel__stats">
          <StatCard label="Área total" value={`${fazenda.area_total_ha.toFixed(1)} ha`} />
          <StatCard label="Talhões"    value={fazenda.talhoes.length} />
        </div>

        <div className="detail-panel__section-label">Talhões</div>
        <div className="detail-panel__talhoes">
          {fazenda.talhoes.map((t) => (
            <div key={t.id} className="talhao-row">
              <span className="talhao-row__dot" style={{ background: t.cor }} />
              <span className="talhao-row__nome">{t.nome}</span>
              <span className="talhao-row__area">{t.area_ha.toFixed(1)} ha</span>
            </div>
          ))}
        </div> */}
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function FazendaSidebar() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [imagemUrl, setImagemUrl] = useState();
  const [fazendas, setFazendas] = useState([])

  const segmentacao = useApi();
  const { uploadImagem } = segmentacao;

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setImagemUrl(URL.createObjectURL(file));
    uploadImagem(file)
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8000/fazendas');
      const result = await response.json();
      //console.log(result)
      setFazendas(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, []);

  const filtered = fazendas.filter(
    (f) =>
      f.nome.toLowerCase().includes(search.toLowerCase()) ||
      f.localizacao.cidade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fazenda-app">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar__header">
          <div className="sidebar__title">Fazendas</div>

          <div className="sidebar__search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="sidebar__search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar fazenda..."
            />
          </div>
        </div>

        <div className="sidebar__count">
          {filtered.length} fazenda{filtered.length !== 1 ? "s" : ""}
        </div>

        <div className="sidebar__list">
          {filtered.length === 0 ? (
            <div className="sidebar__empty">Nenhuma fazenda encontrada</div>
          ) : (
            filtered.map((f) => (
              <FazendaCard
                key={f.id}
                fazenda={f}
                isSelected={selected?.id === f.id}
                onClick={setSelected}
              />
            ))
          )}
        </div>

        <div className="sidebar__footer">
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
      </aside>

      {/* ── PAINEL DIREITO ── */}
      <DetailPanel
        fazenda={selected}
        imagemUrl={imagemUrl}
        segmentacao={segmentacao}
      />
    </div>
  );
}
