import { useState, useEffect, useRef } from 'react'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import '../styles/App.scss'
import MapToolbar from "./MapToolbar";


function MapaFazenda({ imagemUrl, clicarPonto, talhoes, preview, confirmarTalhao,
  reiniciar, desfazer, carregando
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const talhoesLayerRef = useRef([])
  const previewLayerRef = useRef(null)
  const pontosLayerRef = useRef([])
  const imageLayerRef = useRef(null)

  const [height, setHeight] = useState(null)

  function latLngParaPixel(latlng, alturaImagem) {
    return {
      x: latlng.lng,
      y: alturaImagem - latlng.lat
    }
  }

  function limparPontos() {
    const map = mapInstanceRef.current

    pontosLayerRef.current.forEach(m => map.removeLayer(m))
    pontosLayerRef.current = []
  }

  useEffect(() => {
    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -3,
      zoomDelta: 0.25,
      zoomSnap: 0,
      zoomControl: false,
    });
    mapInstanceRef.current = map;
    return () => map.remove();
  }, []);

  //RENDERIZA IMAGEM//
  useEffect(() => {
  if (!imagemUrl || !mapInstanceRef.current) return

  const map = mapInstanceRef.current
  const img = new Image()

  img.onload = () => {

    const bounds = [[0, 0], [img.height, img.width]]

    // remove imagem anterior
    if (imageLayerRef.current) {
      map.removeLayer(imageLayerRef.current)
    }

    // adiciona nova
    imageLayerRef.current = L.imageOverlay(imagemUrl, bounds).addTo(map)

    requestAnimationFrame(() => {
  map.invalidateSize()
  map.fitBounds(bounds)
})

    setHeight(img.height)
  }

  img.src = imagemUrl

  // opcional: limpar pontos ao trocar imagem
  limparPontos()

}, [imagemUrl])

  //RENDERIZA PREVIEW//
useEffect(() => {
  if (!mapInstanceRef.current) return

  const map = mapInstanceRef.current

  // Remove o preview anterior, inclusive quando preview virar null
  if (previewLayerRef.current) {
    map.removeLayer(previewLayerRef.current)
    previewLayerRef.current = null
  }

  // Se não houver preview novo, para por aqui
  if (!preview) return

  const pontos = preview.poligono.map(([x, y]) => [height - y, x])

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


  //RENDERIZA TALHOES//
  useEffect(() => {
  if (!mapInstanceRef.current || !height) return

  const map = mapInstanceRef.current

  // remove antigos
  talhoesLayerRef.current.forEach(layer => {
    map.removeLayer(layer)
  })
  talhoesLayerRef.current = []

  // desenha novos
  talhoes.forEach((talhao) => {

    const pontos = talhao.poligono.map(([x, y]) => [height - y, x])

    const layer = L.polygon(pontos, {
      color: "green",
      weight: 2
    })
      .addTo(map)
      .bindPopup(`Talhão ${talhao.id} — ${talhao.area_pixels} px²`)

    talhoesLayerRef.current.push(layer)
  })

}, [talhoes, height])

  //DETECTA CLIQUES NO MOUSE//
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    function onClick(e) {
      const { x, y } = latLngParaPixel(e.latlng, height)
      console.log(x, y)
      clicarPonto(x, y, 1)

      const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
        radius: 5,
        color: "green"
      }).addTo(map)
      pontosLayerRef.current.push(marker)
    }

    function onRightClick(e) {
      e.originalEvent.preventDefault()

      const { x, y } = latLngParaPixel(e.latlng, height)
      clicarPonto(x, y, 0)

      const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
        radius: 5,
        color: "red"
      }).addTo(map)
      pontosLayerRef.current.push(marker)
    }

    map.on("click", onClick)
    map.on("contextmenu", onRightClick)

    return () => {
      map.off("click", onClick)
      map.off("contextmenu", onRightClick)
    }

  }, [clicarPonto])

  //DETECTA CLIQUES NO TECLADO//
  useEffect(() => {

    function handleKeyDown(e) {

      if (e.repeat) return

      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return

      switch (e.key.toLowerCase()) {

        case "e":
          e.preventDefault()
          confirmarTalhao()
          limparPontos()
          console.log('E press')
          break

        case "z":
          desfazer()
          console.log('Z press')
          limparPontos()
          break

        case "r":
          reiniciar()
          console.log('R press')
          limparPontos()
          break

        case "escape":
          reiniciar()
          console.log('ESC press')
          limparPontos()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }

  }, [confirmarTalhao, reiniciar, desfazer])

  return (
    <div className="map-shell">
      <div className="map-shell__toolbar">
        <MapToolbar
          onConfirm={confirmarTalhao}
          onDelete={desfazer}
          onReset={reiniciar}
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
