import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Cadastro() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form,  setForm]  = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [erros, setErros] = useState({})
  const [erro,  setErro]  = useState('')
  
  // Estado para saber se o usuário clicou no campo de senha
  const [senhaFocada, setSenhaFocada] = useState(false)

  const temOitoCaracteres = form.senha.length >= 8
  const temCaractereEspecial = /[\W_]/.test(form.senha)
  const temLetraMaiuscula = /[A-Z]/.test(form.senha)
  const temNumero = /[0-9]/.test(form.senha)

  function validar() {
    const e = {}
    if (!form.nome.trim())                              e.nome     = 'O nome é obrigatório.'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email  = 'Informe um e-mail válido.'
    
    if (!form.senha) {
      e.senha = 'A senha é obrigatória.'
    } else if (!temOitoCaracteres || !temCaractereEspecial) {
      e.senha = 'A senha deve conter no mínimo 8 caracteres e 1 caractere especial.'
    }

    if (form.confirmar !== form.senha)                  e.confirmar = 'As senhas não coincidem.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errosVal = validar()
    if (Object.keys(errosVal).length > 0) { setErros(errosVal); return }
    try {
      const res = await authService.registrar(form.nome, form.email, form.senha)
      login(res.data.token, res.data.usuario)
      navigate('/resultados')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar conta. Tente novamente.')
    }
  }

  const campo = (id, label, tipo, placeholder) => (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id} type={tipo} placeholder={placeholder}
        value={form[id]}
        onChange={e => setForm({ ...form, [id]: e.target.value })}
        onFocus={() => id === 'senha' && setSenhaFocada(true)}
        autoComplete={tipo === 'password' ? 'new-password' : id}
      />
      {erros[id] && <span className="campo-erro">{erros[id]}</span>}

      {/* MODIFICAÇÃO: Aparece se estiver focado OU se o preenchimento automático do Chrome colocar texto ali */}
      {id === 'senha' && (senhaFocada || form.senha.length > 0) && (
        <div className="senha-requisitos">
          <div className={`requisito-item ${temOitoCaracteres ? 'valido' : 'invalido'}`}>
            <span className="requisito-icone">{temOitoCaracteres ? '✓' : '✕'}</span> Mínimo de 8 caracteres
          </div>
          <div className={`requisito-item ${temCaractereEspecial ? 'valido' : 'invalido'}`}>
            <span className="requisito-icone">{temCaractereEspecial ? '✓' : '✕'}</span> Pelo menos 1 caractere especial (!@#$...)
          </div>
          <div className={`requisito-item ${temLetraMaiuscula ? 'valido' : 'invalido'}`}>
            <span className="requisito-icone">{temLetraMaiuscula ? '✓' : '✕'}</span> Pelo menos 1 letra maiscula  (!@#$...)
          </div>
          <div className={`requisito-item ${temNumero ? 'valido' : 'invalido'}`}>
            <span className="requisito-icone">{temNumero ? '✓' : '✕'}</span> Pelo menos 1 numero  (!@#$...)
          </div>
        </div>
      )}
    </div>
  )

  return (
    <main className="auth-wrap tela-cadastro">
      <div className="auth-box">
        <div className="auth-logo">VivaPG</div>
        <p className="auth-sub">Crie sua conta para salvar bairros e comparações</p>

        {erro && <div className="form-erro-banner" role="alert">{erro}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {campo('nome',      'Nome completo',   'text',     'Seu nome')}
          {campo('email',     'E-mail',          'email',    'seu@email.com')}
          {campo('senha',     'Senha',           'password', 'Crie uma senha forte')}
          {campo('confirmar', 'Confirmar senha', 'password', 'Repita a senha')}
          <button type="submit" className="btn-auth">✓ Criar minha conta</button>
        </form>

        <div className="auth-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </div>
        <div className="auth-skip">
          <Link to="/">Continuar sem conta →</Link>
        </div>
      </div>
    </main>
  )
}