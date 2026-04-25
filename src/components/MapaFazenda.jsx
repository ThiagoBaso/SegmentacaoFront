import { useState, useEffect, useRef } from 'react'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import '../styles/App.scss'
import MapToolbar from "./MapToolbar";

function MapaFazenda({ imagemUrl, clicarPonto, talhoes, preview, confirmarTalhao,
  reiniciar, desfazer, carregando, sessionId, boundsReais, largura, altura, editarPoligono, exportarGeoJSON,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const talhoesLayerRef = useRef([])
  const previewLayerRef = useRef(null)
  const pontosLayerRef = useRef([])
  const imageLayerRef = useRef(null)
  const verticesLayerRef = useRef([])

  const [height, setHeight] = useState(null)
  const [modo, setModo] = useState(0)

  // Converte pixel (SAM) → lat/lng (Leaflet) considerando bounds reais
  function pixelParaLatLng(x, y, imgLargura, imgAltura) {
    if (boundsReais) {
      const [[latMin, lngMin], [latMax, lngMax]] = boundsReais
      const lng = lngMin + (x / imgLargura) * (lngMax - lngMin)
      const lat = latMax - (y / imgAltura) * (latMax - latMin)
      return [lat, lng]
    }
    // fallback CRS.Simple: y invertido
    return [imgAltura - y, x]
  }

  // Converte clique lat/lng (Leaflet) → pixel (SAM)
  function latLngParaPixel(latlng, imgLargura, imgAltura) {
    if (boundsReais) {
      const [[latMin, lngMin], [latMax, lngMax]] = boundsReais
      const x = Math.round((latlng.lng - lngMin) / (lngMax - lngMin) * imgLargura)
      const y = Math.round((latMax - latlng.lat) / (latMax - latMin) * imgAltura)
      return { x, y }
    }
    // fallback CRS.Simple
    return { x: latlng.lng, y: imgAltura - latlng.lat }
  }

  function clickConfirm() { confirmarTalhao(); limparPontos() }
  function clickReset() { reiniciar(); limparPontos() }
  function clickDesfazer() { desfazer(); limparPontos() }

  function limparPontos() {
    const map = mapInstanceRef.current
    pontosLayerRef.current.forEach(m => map.removeLayer(m))
    pontosLayerRef.current = []
  }

  function limparVertices() {
    const map = mapInstanceRef.current
    verticesLayerRef.current.forEach(m => map.removeLayer(m))
    verticesLayerRef.current = []
  }

  function alterarModo(x) {
    setModo(prev => prev === x ? 0 : x)
    limparPontos()
    limparVertices()
    reiniciar()
  }

  // Distância de um ponto P a um segmento AB (em coordenadas lat/lng)
  function distPontoSegmento(p, a, b) {
    const ax = a[1], ay = a[0]  // lng, lat
    const bx = b[1], by = b[0]
    const px = p[1], py = p[0]

    const dx = bx - ax
    const dy = by - ay
    const lenSq = dx * dx + dy * dy

    if (lenSq === 0) {
      // Segmento degenerado — retorna distância ao ponto A
      return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2)
    }

    // Projeta P sobre o segmento AB, clampado entre 0 e 1
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
    const projX = ax + t * dx
    const projY = ay + t * dy

    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
  }

  // INICIALIZA MAPA — CRS depende de georeferência
  useEffect(() => {
    const crs = boundsReais ? L.CRS.EPSG3857 : L.CRS.Simple

    const map = L.map(mapRef.current, {
      crs,
      minZoom: boundsReais ? 1 : -3,
      zoomDelta: 0.25,
      zoomSnap: 0,
      zoomControl: false,
      attributionControl: false
    });
    mapInstanceRef.current = map;
    return () => map.remove();
  }, []);

  // RENDERIZA IMAGEM
  useEffect(() => {
    if (!imagemUrl || !mapInstanceRef.current) return

    const map = mapInstanceRef.current

    if (imageLayerRef.current) {
      map.removeLayer(imageLayerRef.current)
    }

    if (boundsReais) {
      imageLayerRef.current = L.imageOverlay(imagemUrl, boundsReais).addTo(map)
      requestAnimationFrame(() => {
        map.invalidateSize()
        map.fitBounds(boundsReais)
      })
      // altura/largura vêm como props do backend
      setHeight(altura)
    } else {
      const img = new Image()
      img.onload = () => {
        const bounds = [[0, 0], [img.height, img.width]]
        imageLayerRef.current = L.imageOverlay(imagemUrl, bounds).addTo(map)
        requestAnimationFrame(() => {
          map.invalidateSize()
          map.fitBounds(bounds)
        })
        setHeight(img.height)
      }
      img.src = imagemUrl
    }

    limparPontos()
  }, [imagemUrl, boundsReais])

  // RENDERIZA PREVIEW
  useEffect(() => {
    if (!mapInstanceRef.current || !height) return

    const map = mapInstanceRef.current

    if (previewLayerRef.current) {
      map.removeLayer(previewLayerRef.current)
      previewLayerRef.current = null
    }

    if (!preview) return

    const pontos = preview.poligono.map(([x, y]) =>
      pixelParaLatLng(x, y, largura, altura)
    )

    const layer = L.polygon(pontos, {
      color: "yellow",
      weight: 2,
      dashArray: "5,5"
    }).addTo(map)

    layer.bindPopup(
      `Preview — ${preview.area_pixels} px² | Score: ${(preview.score * 100).toFixed(1)}%`
    )

    previewLayerRef.current = layer
  }, [preview, height])

  // RENDERIZA TALHÃO
  useEffect(() => {
    if (!mapInstanceRef.current || !height) return

    const map = mapInstanceRef.current

    talhoesLayerRef.current.forEach(layer => map.removeLayer(layer))
    talhoesLayerRef.current = []
    limparVertices()

    talhoes.forEach((talhao) => {
      const pontosLatLng = talhao.poligono.map(([x, y]) =>
        pixelParaLatLng(x, y, largura, altura)
      )

      const layer = L.polygon(pontosLatLng, { color: "red", weight: 2 })
        .addTo(map)
        .bindPopup(`Talhão ${talhao.id} — ${talhao.area_pixels} px²`)

      talhoesLayerRef.current.push(layer)

      if (modo === 2) {
        const pontosEditaveis = pontosLatLng.map(p => [...p])
        const markersDoTalhao = []  // ← array local, isolado por talhão

        function criarDragMarker(latLng, index) {
          const marker = L.marker(latLng, {
            icon: L.divIcon({
              className: "vertice-drag-icon",
              html: `<div style="
                      width: 12px; height: 12px;
                      border-radius: 50%;
                      background: #E8541A;
                      border: 2px solid #fff;
                      cursor: grab;
                      margin-left: -7px;
                      margin-top: -7px;
                      transition: transform 0.15s ease;
                    "></div>`,
              iconSize: [5, 5],
            }),
            draggable: true,
            zIndexOffset: 1000,
          }).addTo(map)

          marker.on("mouseover", () => {
            marker.getElement().querySelector("div").style.transform = "scale(1.5)"
          })
          marker.on("mouseout", () => {
            marker.getElement().querySelector("div").style.transform = "scale(1)"
          })

          marker.on("drag", (e) => {
            const { lat, lng } = e.target.getLatLng()
            const idx = markersDoTalhao.indexOf(marker)  // ← índice no array local
            if (idx === -1) return
            pontosEditaveis[idx] = [lat, lng]
            layer.setLatLngs(pontosEditaveis)
          })

          marker.on("dragend", () => {
            const poligonoPixel = pontosEditaveis.map(([lat, lng]) => {
              const { x, y } = latLngParaPixel({ lat, lng }, largura, altura)
              return [x, y]
            })
            editarPoligono(talhao.id, poligonoPixel)
          })

          markersDoTalhao.push(marker)          // ← registra no array local
          verticesLayerRef.current.push(marker) // ← registra no ref para limpeza
          return marker
        }

        pontosEditaveis.forEach((latLng) => {
          criarDragMarker(latLng)
        })

        layer.on("contextmenu", (e) => {
          e.originalEvent.preventDefault()
          e.originalEvent.stopPropagation()

          const { lat, lng } = e.latlng
          const novoP = [lat, lng]

          let menorDist = Infinity
          let melhorIdx = 0
          const n = pontosEditaveis.length

          for (let i = 0; i < n; i++) {
            const a = pontosEditaveis[i]
            const b = pontosEditaveis[(i + 1) % n]
            const dist = distPontoSegmento(novoP, a, b)
            if (dist < menorDist) {
              menorDist = dist
              melhorIdx = i
            }
          }

          const insertIdx = melhorIdx + 1
          pontosEditaveis.splice(insertIdx, 0, novoP)
          layer.setLatLngs(pontosEditaveis)

          // Remove só os markers deste talhão
          markersDoTalhao.forEach(m => {
            map.removeLayer(m)
            const idx = verticesLayerRef.current.indexOf(m)
            if (idx !== -1) verticesLayerRef.current.splice(idx, 1)
          })
          markersDoTalhao.length = 0

          pontosEditaveis.forEach((p) => criarDragMarker(p))
        })
      }
    })
  }, [talhoes, height, modo])

  // DETECTA CLIQUES NO MOUSE
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    function onClick(e) {
      if (modo !== 1) return

      const { x, y } = latLngParaPixel(e.latlng, largura, altura)
      clicarPonto(x, y, 1)

      const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
        radius: 5, color: "green"
      }).addTo(map)
      pontosLayerRef.current.push(marker)
    }

    function onRightClick(e) {
      if (modo !== 1) return
      
      e.originalEvent.preventDefault()
      const { x, y } = latLngParaPixel(e.latlng, largura, altura)
      clicarPonto(x, y, 0)

      const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
        radius: 5, color: "red"
      }).addTo(map)
      pontosLayerRef.current.push(marker)
    }

    map.on("click", onClick)
    map.on("contextmenu", onRightClick)

    return () => {
      map.off("click", onClick)
      map.off("contextmenu", onRightClick)
    }
  }, [clicarPonto, modo, largura, altura, boundsReais])

  // DETECTA CLIQUES NO TECLADO
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.repeat) return
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return

      switch (e.key.toLowerCase()) {
        case "e": e.preventDefault(); clickConfirm(); break
        case "r": clickReset(); break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [confirmarTalhao, reiniciar, desfazer])

  return (
    <div className="map-shell">
      <div className="map-shell__toolbar">
        <MapToolbar
          onSegment={() => alterarModo(1)}
          onDrag={() => alterarModo(2)}
          onConfirm={clickConfirm}
          onDelete={clickDesfazer}
          onReset={clickReset}
          onSave={() => exportarGeoJSON()}
        />
      </div>

      {preview && (
        <p className="map-shell__preview">
          Prévia — Área: {preview.area_pixels.toLocaleString()} px²
          | Score: {(preview.score * 100).toFixed(0)}%
        </p>
      )}

      <div ref={mapRef} className='leaflet-container' />
    </div>
  );
}

export default MapaFazenda