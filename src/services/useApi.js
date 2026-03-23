const API_URL = "http://localhost:8000"
import { useState, useEffect, useRef, useCallback} from 'react'

export function useApi() {
  const [sessionId, setSessionId] = useState(null)
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
    setCarregando(false)

    // Abre WebSocket logo após o upload
    abrirWebSocket(dados.session_id)

    console.log(dados)

    return dados   // { session_id, largura, altura }
  }

  const abrirWebSocket = useCallback((sid) => {
    if (ws.current) ws.current.close()

    ws.current = new WebSocket(`ws://localhost:8000/ws/${sid}`)

    ws.current.onopen = () => {
      console.log("WebSocket conectado")
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
            t.id === msg.id ? { ...t, area_pixels: msg.area_pixels } : t
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
  sessionId, talhoes, preview, carregando, erro,
  uploadImagem,
  clicarPonto,
  confirmarTalhao,
  desfazer,
  reiniciar,
  editarPoligono,
}
}