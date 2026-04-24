import { useState, useEffect, useRef, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL
const WS_URL = import.meta.env.VITE_WS_URL

export function useApi() {
  const [sessionId, setSessionId] = useState(null)
  const [boundsreais, setBoundsReais] = useState(null)
  const [georeferenciada, setGeoreferenciada] = useState()
  const [largura, setLargura] = useState(null)
  const [altura, setAltura] = useState(null)
  const [talhoes, setTalhoes] = useState([])
  const [preview, setPreview] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const ws = useRef(null)


  const uploadImagem = async (arquivo) => {
    setCarregando(true)
    setErro(null)

    const form = new FormData()
    form.append("arquivo", arquivo)

    const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form })
    const dados = await res.json()

    if (!res.ok) {
      setErro(dados.detail)
      setCarregando(false)
      return null
    }

    setSessionId(dados.session_id)
    setBoundsReais(dados.bounds)
    setGeoreferenciada(dados.georeferenciada)
    setLargura(dados.largura)
    setAltura(dados.altura)

    abrirWebSocket(dados.session_id)

    setCarregando(false)
    return dados
  }

  const exportarGeoJSON = async () => {
    console.log("save")
    if (!sessionId) return

    const res = await fetch(`${API_URL}/exportar/${sessionId}`)
    if (!res.ok) {
        const err = await res.json()
        setErro(err.detail)
        return
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `talhoes_${sessionId.slice(0, 8)}.geojson`
    a.click()
    URL.revokeObjectURL(url)
}

  const abrirWebSocket = useCallback((sid) => {
    if (ws.current) ws.current.close()

    ws.current = new WebSocket(`${WS_URL}/ws/${sid}`)

    ws.current.onopen = () => {
      console.log("WebSocket conectado")
      setCarregando(false)
    }

    // Trata todas as mensagens recebidas do servidor
    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      switch (msg.tipo) {

        // Prévia em tempo real enquanto o usuário clica
        case "preview":
          console.log(msg)
          setPreview({
            poligono: msg.poligono,      // [[x,y], ...]
            area_pixels: msg.area_pixels,
            score: msg.score,
          })
          break

        // Talhão foi confirmado
        case "talhao_confirmado":
          setTalhoes(msg.todos_talhoes)
          console.log('talhoes')
          console.log(msg)
          console.log(talhoes)
          setPreview(null)
          break

        // Talhão foi desfeito
        case "desfeito":
          setTalhoes(msg.todos_talhoes)
          break

        // Pontos reiniciados
        case "reiniciado":
          setPreview(null)
          break

        // Polígono editado manualmente
        case "poligono_editado":
          setTalhoes(prev => prev.map(t =>
            t.id === msg.id
              ? { ...t, poligono: msg.poligono, area_pixels: msg.area_pixels }
              : t
          ))
          break

        case "erro":
          setErro(msg.mensagem)
          break
      }
    }

    ws.current.onerror = () => setErro("Erro na conexão com o servidor.")
    ws.current.onclose = () => console.log("WebSocket encerrado")
  }, [])

  const enviar = (dados) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setErro("WebSocket não conectado.")
      return
    }
    ws.current.send(JSON.stringify(dados))
  }

  // Usuário clicou na imagem (clique esquerdo = incluir, direito = excluir)
  function clicarPonto(x, y, label = 1) {
    enviar({ acao: "ponto", x, y, label })
    console.log('ponto enviado')
  }

  // Confirma o talhão em andamento e começa o próximo
  function confirmarTalhao() {
    enviar({ acao: "confirmar" })
  }

  // Desfaz o último talhão confirmado
  function desfazer() {
    enviar({ acao: "desfazer" })
  }

  // Reinicia os pontos do talhão em edição
  function reiniciar() {
    enviar({ acao: "reiniciar" })
  }

  // Usuário arrastou ponto no Leaflet — envia polígono editado
  function editarPoligono(id, novoPoligono) {
    console.log(id, novoPoligono)
    enviar({ acao: "editar_poligono", id, poligono: novoPoligono })
  }

  useEffect(() => {
    return () => {
      if (ws.current) {
        console.log("Fechando WebSocket...")
        ws.current.close()
      }
    }
  }, [])

  return {
    sessionId, talhoes, preview, carregando, erro, boundsreais, georeferenciada,
    largura, altura, API_URL,
    uploadImagem,
    clicarPonto,
    confirmarTalhao,
    desfazer,
    reiniciar,
    editarPoligono,
    exportarGeoJSON,
  }
}
