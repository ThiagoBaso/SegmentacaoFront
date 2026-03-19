const API_URL = "http://localhost:8000"

async function uploadImagem(arquivo, setCarregando, setErro, setSessionId) {
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
    //abrirWebSocket(dados.session_id)

    console.log(dados)

    return dados   // { session_id, largura, altura }
}

async function encerrarSessao() {
    // if (ws.current) ws.current.close()
    // if (sessionId) {
    //   await fetch(`${API_URL}/sessao/${sessionId}`, { method: "DELETE" })
    // }
}

export { uploadImagem, encerrarSessao }