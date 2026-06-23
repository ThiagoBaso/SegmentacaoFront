# 🌱 Segmentação de Talhões Agrícolas

Sistema web para segmentação interativa de áreas agrícolas (talhões) a partir de imagens de satélite Sentinel-2, com edição manual de polígonos, cálculo de área e exportação GeoJSON.

![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python&logoColor=white)
![SAM-HQ](https://img.shields.io/badge/SAM--HQ-Meta%20AI-orange?style=flat-square)

<img width="400" height="225" alt="seg1" src="https://github.com/user-attachments/assets/cb9a8d26-7b30-4a24-975d-69385c36cb27" />
<img width="400" height="225" alt="seg3" src="https://github.com/user-attachments/assets/e2c672a4-9393-48a8-9da2-e1da49376bb1" />
<img width="400" height="225" alt="seg2" src="https://github.com/user-attachments/assets/bcfd6fda-af0a-4557-8563-2ae33582888c" />

---

## 📋 Sobre o Projeto

Permite que o usuário carregue imagens de satélite (GeoTIFF), clique sobre um talhão na tela e receba automaticamente o polígono segmentado daquela área — gerado pelo modelo **SAM-HQ** (Segment Anything in High Quality). O resultado pode ser refinado com edição manual de vértices, consultado em área (hectares) e exportado como GeoJSON para uso em outras ferramentas GIS.

O projeto está dividido em dois repositórios independentes:

| Repositório | Descrição |
|-------------|-----------|
| [SegmentacaoFront](https://github.com/ThiagoBaso/SegmentacaoFront) | Interface React + Leaflet para interação com o mapa e visualização dos talhões |
| [SegmentacaoBack](https://github.com/ThiagoBaso/SegmentacaoBack) | API FastAPI responsável pelo processamento de imagem e inferência com SAM-HQ |

---

## ✨ Funcionalidades

- **Upload de GeoTIFF** — carregamento e renderização de imagens de satélite Sentinel-2 georreferenciadas
- **Segmentação por clique** — o usuário clica em um ponto da imagem e o modelo SAM-HQ retorna o polígono do talhão correspondente
- **Edição de polígonos** — arrastar vértices individualmente para ajuste fino do contorno
- **Cálculo de área** — exibição automática da área do talhão em hectares
- **Exportação GeoJSON** — download do polígono no formato padrão para uso em QGIS, ArcGIS ou outras ferramentas

---

## 🛠️ Tecnologias

### Front-end
| Tecnologia | Uso |
|------------|-----|
| React | Interface e gerenciamento de estado |
| Leaflet | Renderização do mapa e manipulação de camadas GeoTIFF |
| JavaScript | Lógica de interação e comunicação com a API |

### Back-end
| Tecnologia | Uso |
|------------|-----|
| Python 3.10+ | Linguagem principal |
| FastAPI | API REST para receber requisições e retornar polígonos |
| SAM-HQ (Meta AI) | Modelo de segmentação de imagens de alta qualidade |
| Rasterio | Leitura e processamento de arquivos GeoTIFF |
| NumPy | Manipulação de arrays de imagem |

---

## 🏗️ Arquitetura

```
Usuário
  │
  │  clique no mapa (lat/lng + imagem)
  ▼
React + Leaflet  ──── POST /segment ────►  FastAPI
  │                                           │
  │                                        SAM-HQ
  │                                           │
  │  ◄──── GeoJSON (polígono + hectares) ─────┘
  │
Edição de vértices → Exportação GeoJSON
```

O front-end envia as coordenadas do ponto clicado junto com a imagem para a API. O back-end converte as coordenadas, executa a inferência com SAM-HQ e retorna o polígono como GeoJSON. O front-end renderiza o resultado no mapa e permite ao usuário editar e exportar.

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Python 3.10+
- pip

### Front-end

```bash
git clone https://github.com/ThiagoBaso/SegmentacaoFront.git
cd SegmentacaoFront

npm install
npm run dev
```

Acesse `http://localhost:5173`

### Back-end

```bash
git clone https://github.com/ThiagoBaso/SegmentacaoBack.git
cd SegmentacaoBack

pip install -r requirements.txt
uvicorn main:app --reload
```

API disponível em `http://localhost:8000`

> **Nota:** O modelo SAM-HQ requer o download dos pesos antes da primeira execução. Consulte o README do repositório de back-end para instruções detalhadas.

---

## 📚 Conceitos Aplicados

- Integração de modelo de visão computacional (SAM-HQ) em uma API REST
- Processamento de imagens georreferenciadas com Rasterio e conversão de CRS
- Renderização de GeoTIFF e GeoJSON no browser via Leaflet
- Edição interativa de geometrias com drag de vértices
- Cálculo de área geodésica em hectares a partir de coordenadas geográficas
- Comunicação desacoplada entre front-end e back-end via API
