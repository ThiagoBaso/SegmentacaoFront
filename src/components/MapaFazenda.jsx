import { useState, useEffect, useRef } from 'react'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import '../styles/App.scss'
import MapToolbar from "./MapToolbar";


function MapaFazenda({ imagemUrl, clicarPonto, talhoes, preview, confirmarTalhao,
  reiniciar, desfazer, carregando, sessionId, boundsReais
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const talhoesLayerRef = useRef([])
  const previewLayerRef = useRef(null)
  const pontosLayerRef = useRef([])
  const imageLayerRef = useRef(null)

  const [height, setHeight] = useState(null)
  const [modo, setModo] = useState(0)

  console.log("MODO:", modo)

  function latLngParaPixel(latlng, alturaImagem) {
    return {
      x: latlng.lng,
      y: alturaImagem - latlng.lat
    }
  }

  function clickConfirm() {
    confirmarTalhao()
    limparPontos()
    console.log('E press')
  }

  function clickReset() {
    reiniciar()
    limparPontos()
    console.log('R press')
  }

  function clickDesfazer() {
    desfazer()
    limparPontos()
    console.log('Z press')
  }

  function limparPontos() {
    const map = mapInstanceRef.current

    pontosLayerRef.current.forEach(m => map.removeLayer(m))
    pontosLayerRef.current = []
  }

  function alterarModo(x) {
    if (x == modo) { setModo(0) }
    else if (x != modo) { setModo(x) }

    limparPontos()
    reiniciar()
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
  // useEffect(() => {
  //   if (!imagemUrl || !mapInstanceRef.current) return

  //   const map = mapInstanceRef.current
  //   const img = new Image()

  //   img.onload = () => {

  //     const bounds = [[0, 0], [img.height, img.width]]

  //     // remove imagem anterior
  //     if (imageLayerRef.current) {
  //       map.removeLayer(imageLayerRef.current)
  //     }

  //     // adiciona nova
  //     imageLayerRef.current = L.imageOverlay(imagemUrl, bounds).addTo(map)

  //     requestAnimationFrame(() => {
  //       map.invalidateSize()
  //       map.fitBounds(bounds)
  //     })

  //     setHeight(img.height)
  //   }

  //   img.src = imagemUrl

  //   //limpar pontos ao trocar imagem
  //   limparPontos()

  // }, [imagemUrl])

useEffect(() => {
    if (!sessionId || !mapInstanceRef.current) return

    const map = mapInstanceRef.current

    if (imageLayerRef.current) {
        map.removeLayer(imageLayerRef.current)
    }

    

    if (boundsReais) {
        // Imagem georeferenciada: usa bounds lat/lng vindos do backend
        imageLayerRef.current = L.imageOverlay(imagemUrl, boundsReais).addTo(map)
        requestAnimationFrame(() => {
            map.invalidateSize()
            map.fitBounds(boundsReais)
        })
    } else {
        // Fallback: imagem sem georeferência (comportamento original)
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
}, [sessionId, boundsReais])

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

      if (modo == 1) {
        const { x, y } = latLngParaPixel(e.latlng, height)
        console.log(x, y)
        clicarPonto(x, y, 1)

        const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
          radius: 5,
          color: "green"
        }).addTo(map)
        pontosLayerRef.current.push(marker)
      }
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

  }, [clicarPonto, modo])

  //DETECTA CLIQUES NO TECLADO//
  useEffect(() => {

    function handleKeyDown(e) {

      if (e.repeat) return

      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return

      switch (e.key.toLowerCase()) {

        case "e":
          e.preventDefault()
          clickConfirm()
          break

        case "z":

          break

        case "r":
          clickReset()
          break

        case "escape":
          //clickReset()
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
          onSegment={() => (alterarModo(1))}
          onDrag={() => (alterarModo(2))}
          onConfirm={() => (clickConfirm())}
          onDelete={() => (clickDesfazer())}
          onReset={() => (clickReset())}
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
