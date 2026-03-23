import { useRef, useState } from "react"
import { uploadImagemAPI } from "../services/api"
import abrirWebSocket from '../services/api'

export function useUploadImagem() {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [sessionId, setSessionId] = useState(null)

  const ws = useRef(null)

  async function uploadImagem(arquivo) {
    try {
      setCarregando(true)
      setErro(null)

      const dados = await uploadImagemAPI(arquivo)

      setSessionId(dados.session_id)
      abrirWebSocket(dados.session_id)

      return dados
    } catch (err) {
      setErro(err.message)
      return null
    } finally {
      setCarregando(false)
    }
  }

  return {
    uploadImagem,
    carregando,
    erro,
    sessionId,
    ws
  }
}