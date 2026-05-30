# VivaPG — Sistema de Recomendação de Bairros

**FATEC Praia Grande** | Projeto Integrador 2026

---

## Stack

- **Backend**: Java 17 + Spring Boot 3.2 + Spring Security + JWT
- **Banco**: MongoDB
- **Frontend**: React 18 + Vite + React Router

---

## Estrutura do Projeto

```
## Estrutura do Projeto

vivapg/
├── backend/               ← Spring Boot
│   ├── pom.xml
│   └── src/main/java/br/edu/fatecpg/vivapg/
│       ├── config/        ← DataSeeder, SecurityConfig
│       ├── controller/    ← ApistatusController.java, AuthController, BairroController,
│       │                     ComparacaoController, FavoritoController, HistoricoController,
│       │                     RecomendacaoController, UsuarioController
│       ├── model/         ← Bairro, Comparacao, Favorito, Historico, Perfil, Usuario
│       ├── repository/    ← BairroRepository, ComparacaoRepository, FavoritoRepository,
│       │                     HistoricoRepository, PerfilRepository, Repositories.java,
│       │                     UsuarioRepository
│       ├── security/      ← JwtFilter, JwtService
│       ├── service/       ← ApiIntegrationService, AuthService, FavoritoService,
│       │                     RecomendacaoService, UsuarioService
│       └── VivaPGApplication.java
└── frontend/              ← React + Vite
    └── src/
        ├── components/
        │   ├── layout/    ← Navbar.jsx
        │   └── ui/        ← BairroCard.jsx, MapaModal.jsx, PainelAcessibilidade.jsx
        ├── context/       ← AuthContext.jsx
        ├── pages/         ← Cadastro.jsx, Comparacao.jsx, ConhecaPG.jsx, Home.jsx,
        │                     Login.jsx, MinhaConta.jsx, Resultados.jsx, Sobre.jsx
        ├── services/      ← api.js (axios)
        ├── styles/        ← global.css
        ├── App.jsx
        └── main.jsx
```

---

## Como Rodar

### Pré-requisitos
- Java 17+
- Maven 3.8+
- Node.js 18+
- MongoDB rodando na porta 27017

### Backend
```bash
cd backend
mvn spring-boot:run
```
API disponível em: `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App disponível em: `http://localhost:5173`

---

## Endpoints da API

| Método | Endpoint                  | Auth | Descrição                    |
|--------|---------------------------|------|------------------------------|
| POST   | /api/auth/registrar       | ✗    | Criar conta                  |
| POST   | /api/auth/login           | ✗    | Login                        |
| POST   | /api/recomendacao         | ✗    | Buscar bairros recomendados  |
| GET    | /api/bairros              | ✗    | Listar todos os bairros      |
| GET    | /api/bairros/{id}         | ✗    | Buscar bairro por ID         |
| GET    | /api/favoritos            | ✓    | Listar favoritos             |
| POST   | /api/favoritos            | ✓    | Salvar favorito              |
| DELETE | /api/favoritos/{bairroId} | ✓    | Remover favorito             |
| GET    | /api/comparacoes          | ✓    | Listar comparações salvas    |
| POST   | /api/comparacoes          | ✓    | Salvar comparação            |
| DELETE | /api/comparacoes/{id}     | ✓    | Excluir comparação           |
| GET    | /api/historico            | ✓    | Ver histórico de buscas      |
| GET    | /api/usuarios/me          | ✓    | Ver meu perfil               |
| POST   | /api/usuarios/me/perfil   | ✓    | Salvar preferências          |
| PUT    | /api/usuarios/me/senha    | ✓    | Alterar senha                |
| DELETE | /api/usuarios/me          | ✓    | Excluir conta                |
