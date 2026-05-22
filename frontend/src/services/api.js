import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Injeta token em todas as requisições autenticadas
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vivapg_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auth ────────────────────────────────────────────────
export const authService = {
  login:     (email, senha)         => api.post('/auth/login',     { email, senha }),
  registrar: (nome, email, senha)   => api.post('/auth/registrar', { nome, email, senha }),
}

// ── Bairros ─────────────────────────────────────────────
export const bairroService = {
  listarTodos: ()     => api.get('/bairros'),
  buscarPorId: (id)   => api.get(`/bairros/${id}`),
}

// ── Recomendação ────────────────────────────────────────
export const recomendacaoService = {
  buscar: (perfil) => api.post('/recomendacao', perfil),
}

// ── Favoritos ───────────────────────────────────────────
export const favoritoService = {
  listar:  ()          => api.get('/favoritos'),
  salvar:  (bairroId)  => api.post('/favoritos', { bairroId }),
  remover: (bairroId)  => api.delete(`/favoritos/${bairroId}`),
}

// ── Comparações ─────────────────────────────────────────
export const comparacaoService = {
  listar:  ()             => api.get('/comparacoes'),
  salvar:  (bairrosIds)   => api.post('/comparacoes', { bairrosIds }),
  excluir: (id)           => api.delete(`/comparacoes/${id}`),
}

// ── Histórico ───────────────────────────────────────────
export const historicoService = {
  listar:  ()   => api.get('/historico'),
  excluir: (id) => api.delete(`/historico/${id}`),
}

// ── Usuário ─────────────────────────────────────────────
export const usuarioService = {
  meuPerfil:     ()          => api.get('/usuarios/me'),
  salvarPerfil:  (perfil)    => api.post('/usuarios/me/perfil', perfil),
  alterarSenha:  (novaSenha) => api.put('/usuarios/me/senha', { novaSenha }),
  excluirConta:  ()          => api.delete('/usuarios/me'),
}

export default api

// ── Comparação — análise dedicada ───────────────────────────
export const analiseService = {
  analisar: (bairro1Id, bairro2Id, perfil) =>
    api.post('/comparacoes/analisar', { bairro1Id, bairro2Id, perfil }),
}