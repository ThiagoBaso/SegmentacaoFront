import { useState, useEffect, useRef } from 'react'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import '../App.scss'


function MapaFazenda({ imagemUrl, clicarPonto, talhoes, preview, confirmarTalhao,
  reiniciar, desfazer, carregando
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  //const talhoesLayerRef = useRef([])
  const previewLayerRef = useRef(null)
  const pontosLayerRef = useRef([])

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
      zoomSnap: 0
    });
    mapInstanceRef.current = map;
    return () => map.remove();
  }, []);

  //RENDERIZA IMAGEM E TALHOES//
  useEffect(() => {
    if (!imagemUrl || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const img = new Image();

    console.log(talhoes)

    img.onload = () => {
      const bounds = [[0, 0], [img.height, img.width]];
      L.imageOverlay(imagemUrl, bounds).addTo(map);
      map.fitBounds(bounds);

      setHeight(img.height)

      // Adiciona os polígonos de cada talhão
      talhoes.forEach((talhao) => {
        //    Leaflet usa [lat, lng] == [y, x], por isso inverte [x, y] → [y, x]
        const pontos = talhao.poligono.map(([x, y]) => [img.height - y, x]);

        L.polygon(pontos, { color: "green", weight: 2 })
          .addTo(map)
          .bindPopup(`Talhão ${talhao.id} — ${talhao.area_pixels} px²`);
      });
    };

    img.src = imagemUrl;

    limparPontos()
  }, [imagemUrl, talhoes]);

  //RENDERIZA PREVIEW//
  useEffect(() => {
    if (!preview || !mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // Remove preview anterior
    if (previewLayerRef.current) {
      map.removeLayer(previewLayerRef.current)
    }

    // Converte pontos [x,y] → [y,x]
    const pontos = preview.poligono.map(([x, y]) => [height - y, x])

    // Cria novo polígono
    const layer = L.polygon(pontos, {
      color: "yellow",
      weight: 2,
      dashArray: "5,5" // deixa visual diferente
    }).addTo(map)

    layer.bindPopup(
      `Preview — ${preview.area_pixels} px² | Score: ${(preview.score * 100).toFixed(1)}%`
    )

    previewLayerRef.current = layer

  }, [preview])

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
          console.log('E press')
          break

        case "z":
          desfazer()
          console.log('Z press')
          break

        case "r":
          reiniciar()
          console.log('R press')
          break

        case "escape":
          reiniciar()
          console.log('ESC press')
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }

  }, [confirmarTalhao, reiniciar, desfazer])

  return (
    <div className='centerColun'>

      {preview && (
        <p>
          Prévia — Área: {preview.area_pixels.toLocaleString()} px²
          | Score: {(preview.score * 100).toFixed(0)}%
        </p>
      )}

      <div ref={mapRef} className='map' />
    </div>
  );
}

export default MapaFazenda