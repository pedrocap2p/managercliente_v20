"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Users, DollarSign, Tv, AlertCircle, Plus, Search, Edit, Trash2, Eye, Calendar, Phone, LogOut, Settings, Image, Download, Upload, Shield, UserCheck, Crown, Film, Monitor, Trophy, UserPlus, Lock, RefreshCw, Star, AlertTriangle, Clock, Database, Cloud, Server, Link, Globe, ExternalLink, MessageCircle } from 'lucide-react'

// Importar integração com Supabase
import { SupabaseAPI, initializeTables } from '@/lib/supabase'
import type { SupabaseUsuario, SupabaseCliente, SupabaseServidor, SupabaseBanner } from '@/lib/supabase'

interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
  tipo: 'admin' | 'usuario'
  ativo: boolean
  dataCadastro: string
  ultimoAcesso: string
}

interface Cliente {
  id: string
  nome: string
  whatsapp: string
  plano: string
  status: 'ativo' | 'inativo' | 'suspenso' | 'vencido'
  dataVencimento: string
  valorMensal: number
  dataUltimoPagamento: string
  observacoes: string
  dataCadastro: string
  usuarioId: string
}

interface Pagamento {
  id: string
  clienteId: string
  clienteNome: string
  valor: number
  data: string
  status: 'pago' | 'pendente' | 'atrasado'
  metodo: string
  usuarioId: string
}

interface Banner {
  id: string
  categoria: 'filme' | 'serie' | 'esporte'
  imagemUrl: string
  logoUrl: string
  usuarioId: string
  dataCriacao: string
  sinopse?: string
  dataEvento?: string
  logoPersonalizada?: string
  posicaoLogo?: 'direita' | 'centro'
}

interface Servidor {
  id: string
  nome: string
  link: string
  descricao: string
  ativo: boolean
  dataCriacao: string
  usuarioId: string
}

interface ConfigSistema {
  logoUrl: string
  nomeSistema: string
  corPrimaria: string
  corSecundaria: string
  mensagemCobranca: string
}

interface Plano {
  id: string
  nome: string
  valor: number
  canais: string
  descricao: string
  ativo: boolean
}

interface JogoFutebol {
  id: string
  mandante: string
  visitante: string
  data: string
  horario: string
  campeonato: string
  estadio: string
  status: 'agendado' | 'ao_vivo' | 'finalizado'
  placarMandante?: number
  placarVisitante?: number
  imagemMandante: string
  imagemVisitante: string
  imagemBanner: string
}

// Funções de conversão entre tipos locais e Supabase
const converterUsuarioParaSupabase = (usuario: Usuario): SupabaseUsuario => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  senha: usuario.senha,
  tipo: usuario.tipo,
  ativo: usuario.ativo,
  data_cadastro: usuario.dataCadastro,
  ultimo_acesso: usuario.ultimoAcesso
})

const converterUsuarioDeSupabase = (usuario: SupabaseUsuario): Usuario => ({
  id: usuario.id,
  nome: usuario.nome,
  email: usuario.email,
  senha: usuario.senha,
  tipo: usuario.tipo,
  ativo: usuario.ativo,
  dataCadastro: usuario.data_cadastro,
  ultimoAcesso: usuario.ultimo_acesso
})

const converterClienteParaSupabase = (cliente: Cliente): SupabaseCliente => ({
  id: cliente.id,
  nome: cliente.nome,
  whatsapp: cliente.whatsapp,
  plano: cliente.plano,
  status: cliente.status,
  data_vencimento: cliente.dataVencimento,
  valor_mensal: cliente.valorMensal,
  data_ultimo_pagamento: cliente.dataUltimoPagamento,
  observacoes: cliente.observacoes,
  data_cadastro: cliente.dataCadastro,
  usuario_id: cliente.usuarioId
})

const converterClienteDeSupabase = (cliente: SupabaseCliente): Cliente => ({
  id: cliente.id,
  nome: cliente.nome,
  whatsapp: cliente.whatsapp,
  plano: cliente.plano,
  status: cliente.status,
  dataVencimento: cliente.data_vencimento,
  valorMensal: cliente.valor_mensal,
  dataUltimoPagamento: cliente.data_ultimo_pagamento,
  observacoes: cliente.observacoes,
  dataCadastro: cliente.data_cadastro,
  usuarioId: cliente.usuario_id
})

const converterServidorParaSupabase = (servidor: Servidor): SupabaseServidor => ({
  id: servidor.id,
  nome: servidor.nome,
  link: servidor.link,
  descricao: servidor.descricao,
  ativo: servidor.ativo,
  data_criacao: servidor.dataCriacao,
  usuario_id: servidor.usuarioId
})

const converterServidorDeSupabase = (servidor: SupabaseServidor): Servidor => ({
  id: servidor.id,
  nome: servidor.nome,
  link: servidor.link,
  descricao: servidor.descricao,
  ativo: servidor.ativo,
  dataCriacao: servidor.data_criacao,
  usuarioId: servidor.usuario_id
})

const converterBannerParaSupabase = (banner: Banner): SupabaseBanner => ({
  id: banner.id,
  categoria: banner.categoria,
  imagem_url: banner.imagemUrl,
  logo_url: banner.logoUrl,
  sinopse: banner.sinopse,
  data_evento: banner.dataEvento,
  logo_personalizada: banner.logoPersonalizada,
  posicao_logo: banner.posicaoLogo,
  data_criacao: banner.dataCriacao,
  usuario_id: banner.usuarioId
})

const converterBannerDeSupabase = (banner: SupabaseBanner): Banner => ({
  id: banner.id,
  categoria: banner.categoria,
  imagemUrl: banner.imagem_url,
  logoUrl: banner.logo_url,
  sinopse: banner.sinopse,
  dataEvento: banner.data_evento,
  logoPersonalizada: banner.logo_personalizada,
  posicaoLogo: banner.posicao_logo,
  dataCriacao: banner.data_criacao,
  usuarioId: banner.usuario_id
})

// Sistema de banco de dados híbrido (Local + Supabase)
class DatabaseAPI {
  // Salvar dados localmente E no Supabase
  static async salvarDados(tabela: string, dados: any): Promise<boolean> {
    try {
      // Salvar localmente primeiro (backup)
      const dadosExistentes = this.carregarDados(tabela)
      const novosDados = Array.isArray(dadosExistentes) ? [...dadosExistentes, dados] : [dados]
      localStorage.setItem(`db_${tabela}`, JSON.stringify(novosDados))
      
      // Salvar no Supabase
      let sucessoSupabase = false
      switch (tabela) {
        case 'usuarios':
          sucessoSupabase = await SupabaseAPI.salvarUsuario(converterUsuarioParaSupabase(dados))
          break
        case 'clientes':
          sucessoSupabase = await SupabaseAPI.salvarCliente(converterClienteParaSupabase(dados))
          break
        case 'servidores':
          sucessoSupabase = await SupabaseAPI.salvarServidor(converterServidorParaSupabase(dados))
          break
        case 'banners':
          sucessoSupabase = await SupabaseAPI.salvarBanner(converterBannerParaSupabase(dados))
          break
      }

      console.log(`✅ Dados salvos - Local: ✓ | Supabase: ${sucessoSupabase ? '✓' : '✗'} | Tabela: ${tabela}`)
      return true
    } catch (error) {
      console.error(`❌ Erro ao salvar dados: ${tabela}`, error)
      return false
    }
  }
  
  static async atualizarDados(tabela: string, id: string, dados: any): Promise<boolean> {
    try {
      // Atualizar localmente
      const dadosExistentes = this.carregarDados(tabela)
      if (Array.isArray(dadosExistentes)) {
        const dadosAtualizados = dadosExistentes.map(item => 
          item.id === id ? { ...item, ...dados } : item
        )
        localStorage.setItem(`db_${tabela}`, JSON.stringify(dadosAtualizados))
      }
      
      // Atualizar no Supabase
      let sucessoSupabase = false
      switch (tabela) {
        case 'usuarios':
          sucessoSupabase = await SupabaseAPI.atualizarUsuario(id, dados)
          break
        case 'clientes':
          sucessoSupabase = await SupabaseAPI.atualizarCliente(id, dados)
          break
        case 'servidores':
          sucessoSupabase = await SupabaseAPI.atualizarServidor(id, dados)
          break
      }

      console.log(`✅ Dados atualizados - Local: ✓ | Supabase: ${sucessoSupabase ? '✓' : '✗'} | ${tabela}/${id}`)
      return true
    } catch (error) {
      console.error(`❌ Erro ao atualizar dados: ${tabela}`, error)
      return false
    }
  }
  
  static async excluirDados(tabela: string, id: string): Promise<boolean> {
    try {
      // Excluir localmente
      const dadosExistentes = this.carregarDados(tabela)
      if (Array.isArray(dadosExistentes)) {
        const dadosAtualizados = dadosExistentes.filter(item => item.id !== id)
        localStorage.setItem(`db_${tabela}`, JSON.stringify(dadosAtualizados))
      }
      
      // Excluir do Supabase
      let sucessoSupabase = false
      switch (tabela) {
        case 'usuarios':
          sucessoSupabase = await SupabaseAPI.excluirUsuario(id)
          break
        case 'clientes':
          sucessoSupabase = await SupabaseAPI.excluirCliente(id)
          break
        case 'servidores':
          sucessoSupabase = await SupabaseAPI.excluirServidor(id)
          break
        case 'banners':
          sucessoSupabase = await SupabaseAPI.excluirBanner(id)
          break
      }

      console.log(`✅ Dados excluídos - Local: ✓ | Supabase: ${sucessoSupabase ? '✓' : '✗'} | ${tabela}/${id}`)
      return true
    } catch (error) {
      console.error(`❌ Erro ao excluir dados: ${tabela}`, error)
      return false
    }
  }
  
  static carregarDados(tabela: string): any[] {
    try {
      const dados = localStorage.getItem(`db_${tabela}`)
      return dados ? JSON.parse(dados) : []
    } catch (error) {
      console.error(`❌ Erro ao carregar dados: ${tabela}`, error)
      return []
    }
  }
  
  static async autenticar(email: string, senha: string): Promise<Usuario | null> {
    try {
      // Tentar autenticar no Supabase primeiro
      const usuarioSupabase = await SupabaseAPI.autenticar(email, senha)
      if (usuarioSupabase) {
        return converterUsuarioDeSupabase(usuarioSupabase)
      }

      // Fallback para dados locais
      const usuarios = this.carregarDados('usuarios')
      const usuario = usuarios.find((u: Usuario) => 
        u.email === email && 
        u.senha === senha && 
        u.ativo === true
      )
      
      if (usuario) {
        await this.atualizarDados('usuarios', usuario.id, { ultimoAcesso: new Date().toISOString() })
        console.log(`✅ Login local realizado: ${usuario.nome}`)
        return usuario
      }
      
      console.log(`❌ Credenciais inválidas: ${email}`)
      return null
    } catch (error) {
      console.error('❌ Erro na autenticação:', error)
      return null
    }
  }
  
  static async sincronizarDados(): Promise<void> {
    try {
      console.log('🔄 Iniciando sincronização com Supabase...')
      
      // Carregar dados do Supabase
      const dadosSupabase = await SupabaseAPI.sincronizarTodos()
      
      // Converter e salvar localmente como backup
      if (dadosSupabase.usuarios.length > 0) {
        const usuariosLocais = dadosSupabase.usuarios.map(converterUsuarioDeSupabase)
        localStorage.setItem('db_usuarios', JSON.stringify(usuariosLocais))
      }
      
      if (dadosSupabase.clientes.length > 0) {
        const clientesLocais = dadosSupabase.clientes.map(converterClienteDeSupabase)
        localStorage.setItem('db_clientes', JSON.stringify(clientesLocais))
      }
      
      if (dadosSupabase.servidores.length > 0) {
        const servidoresLocais = dadosSupabase.servidores.map(converterServidorDeSupabase)
        localStorage.setItem('db_servidores', JSON.stringify(servidoresLocais))
      }
      
      if (dadosSupabase.banners.length > 0) {
        const bannersLocais = dadosSupabase.banners.map(converterBannerDeSupabase)
        localStorage.setItem('db_banners', JSON.stringify(bannersLocais))
      }
      
      console.log('✅ Sincronização com Supabase concluída!', {
        usuarios: dadosSupabase.usuarios.length,
        clientes: dadosSupabase.clientes.length,
        servidores: dadosSupabase.servidores.length,
        banners: dadosSupabase.banners.length
      })
    } catch (error) {
      console.error('❌ Erro na sincronização:', error)
    }
  }

  // Sistema de configurações persistentes
  static salvarConfiguracao(config: ConfigSistema): void {
    try {
      localStorage.setItem('manager_pro_config', JSON.stringify(config))
      console.log('✅ Configurações salvas:', config)
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error)
    }
  }

  static carregarConfiguracao(): ConfigSistema {
    try {
      const config = localStorage.getItem('manager_pro_config')
      if (config) {
        return JSON.parse(config)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error)
    }
    
    // Configuração padrão
    return {
      logoUrl: '',
      nomeSistema: 'Manager Pro',
      corPrimaria: '#7c3aed',
      corSecundaria: '#a855f7',
      mensagemCobranca: 'Olá {nome}! Seu plano {plano} vence em {dias} dias. Valor: R$ {valor}. Renove já!'
    }
  }
}

const planosIniciais: Plano[] = [
  { id: '1', nome: 'Básico', valor: 29.90, canais: '100+ canais', descricao: 'Plano básico com canais essenciais', ativo: true },
  { id: '2', nome: 'Premium', valor: 49.90, canais: '200+ canais + filmes', descricao: 'Plano premium com filmes inclusos', ativo: true },
  { id: '3', nome: 'Ultra', valor: 79.90, canais: '300+ canais + filmes + séries', descricao: 'Plano completo com séries', ativo: true },
  { id: '4', nome: 'Família', valor: 99.90, canais: '400+ canais + múltiplas telas', descricao: 'Plano familiar com múltiplas telas', ativo: true }
]

export default function ManagerPro() {
  // Estados de autenticação com banco de dados universal
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [mostrarLogin, setMostrarLogin] = useState(true)
  const [carregandoLogin, setCarregandoLogin] = useState(false)
  const [statusConexao, setStatusConexao] = useState<'online' | 'offline' | 'sincronizando'>('online')

  // Estados do sistema com persistência
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [servidores, setServidores] = useState<Servidor[]>([])
  const [planos, setPlanos] = useState<Plano[]>(planosIniciais)
  const [configSistema, setConfigSistema] = useState<ConfigSistema>(DatabaseAPI.carregarConfiguracao())

  // Estados de UI
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)
  const [servidorEditando, setServidorEditando] = useState<Servidor | null>(null)
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalEditarCliente, setModalEditarCliente] = useState(false)
  const [modalPagamento, setModalPagamento] = useState(false)
  const [modalBanner, setModalBanner] = useState(false)
  const [modalServidor, setModalServidor] = useState(false)
  const [modalEditarServidor, setModalEditarServidor] = useState(false)
  const [modalConfig, setModalConfig] = useState(false)
  const [modalUsuarios, setModalUsuarios] = useState(false)
  const [modalEditarPlano, setModalEditarPlano] = useState(false)
  const [modalAlterarCredenciais, setModalAlterarCredenciais] = useState(false)
  const [modalCriarUsuario, setModalCriarUsuario] = useState(false)
  const [modalEditarUsuario, setModalEditarUsuario] = useState(false)
  const [planoEditando, setPlanoEditando] = useState<Plano | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  // Inicialização do sistema com banco de dados universal + Supabase
  useEffect(() => {
    const inicializarSistema = async () => {
      try {
        setStatusConexao('sincronizando')
        
        // Inicializar tabelas do Supabase
        await initializeTables()
        
        // Sincronizar dados do Supabase
        await DatabaseAPI.sincronizarDados()
        
        // Carregar dados (prioridade: Supabase > Local)
        const dadosSupabase = await SupabaseAPI.sincronizarTodos()
        
        let usuariosFinais = dadosSupabase.usuarios.map(converterUsuarioDeSupabase)
        let clientesFinais = dadosSupabase.clientes.map(converterClienteDeSupabase)
        let servidoresFinais = dadosSupabase.servidores.map(converterServidorDeSupabase)
        let bannersFinais = dadosSupabase.banners.map(converterBannerDeSupabase)

        // Criar usuário admin padrão se não existir
        if (usuariosFinais.length === 0) {
          const adminPadrao: Usuario = {
            id: 'admin',
            nome: 'Administrador',
            email: 'admin@iptv.com',
            senha: 'admin123',
            tipo: 'admin',
            ativo: true,
            dataCadastro: '2024-01-01',
            ultimoAcesso: new Date().toISOString()
          }
          usuariosFinais = [adminPadrao]
          await DatabaseAPI.salvarDados('usuarios', adminPadrao)
        }

        // Dados de exemplo apenas se não houver clientes salvos
        if (clientesFinais.length === 0) {
          const clientesIniciais: Cliente[] = [
            {
              id: '1',
              nome: 'João Silva',
              whatsapp: '(11) 99999-9999',
              plano: 'Premium',
              status: 'ativo',
              dataVencimento: '2024-01-15',
              valorMensal: 49.90,
              dataUltimoPagamento: '2023-12-15',
              observacoes: 'Cliente pontual',
              dataCadastro: '2023-06-10',
              usuarioId: 'admin'
            },
            {
              id: '2',
              nome: 'Maria Santos',
              whatsapp: '(11) 88888-8888',
              plano: 'Básico',
              status: 'ativo',
              dataVencimento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              valorMensal: 29.90,
              dataUltimoPagamento: '2023-11-20',
              observacoes: 'Cliente regular',
              dataCadastro: '2023-08-15',
              usuarioId: 'admin'
            },
            {
              id: '3',
              nome: 'Carlos Oliveira',
              whatsapp: '(11) 77777-7777',
              plano: 'Ultra',
              status: 'ativo',
              dataVencimento: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              valorMensal: 79.90,
              dataUltimoPagamento: '2023-12-01',
              observacoes: 'Cliente VIP',
              dataCadastro: '2023-05-20',
              usuarioId: 'admin'
            }
          ]
          clientesFinais = clientesIniciais
          for (const cliente of clientesIniciais) {
            await DatabaseAPI.salvarDados('clientes', cliente)
          }
        }

        // Aplicar dados carregados
        setUsuarios(usuariosFinais)
        setClientes(clientesFinais)
        setServidores(servidoresFinais)
        setBanners(bannersFinais)

        // Verificar se há usuário logado salvo (sessão persistente universal)
        const sessaoSalva = localStorage.getItem('iptv_sessao_universal')
        if (sessaoSalva) {
          const dadosSessao = JSON.parse(sessaoSalva)
          
          // Verificar no Supabase primeiro, depois localmente
          let usuarioValido = null
          try {
            const usuarioSupabase = await SupabaseAPI.autenticar(dadosSessao.email, dadosSessao.senha || '')
            if (usuarioSupabase) {
              usuarioValido = converterUsuarioDeSupabase(usuarioSupabase)
            }
          } catch (error) {
            console.log('Tentando autenticação local...')
          }
          
          if (!usuarioValido) {
            usuarioValido = usuariosFinais.find(u => u.id === dadosSessao.id && u.ativo)
          }
          
          if (usuarioValido) {
            setUsuarioLogado(usuarioValido)
            setMostrarLogin(false)
            console.log('✅ Sessão restaurada:', usuarioValido.nome)
          } else {
            localStorage.removeItem('iptv_sessao_universal')
          }
        }

        setStatusConexao('online')
        console.log('✅ Sistema inicializado com Supabase + Local')
      } catch (error) {
        console.error('❌ Erro na inicialização:', error)
        setStatusConexao('offline')
      }
    }

    inicializarSistema()
  }, [])

  // Sincronização automática com banco de dados universal
  useEffect(() => {
    const sincronizar = async () => {
      if (usuarios.length > 0) {
        await DatabaseAPI.sincronizarDados()
      }
    }

    // Sincronizar a cada 5 minutos
    const intervalo = setInterval(sincronizar, 5 * 60 * 1000)
    return () => clearInterval(intervalo)
  }, [usuarios, clientes, banners, servidores])

  // Funções de autenticação com banco de dados universal
  const fazerLogin = async (email: string, senha: string) => {
    setCarregandoLogin(true)
    try {
      const usuarioAutenticado = await DatabaseAPI.autenticar(email, senha)
      
      if (usuarioAutenticado) {
        setUsuarioLogado(usuarioAutenticado)
        setMostrarLogin(false)
        
        // Salvar sessão universal para funcionar em qualquer navegador
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('iptv_sessao_universal', JSON.stringify({
          id: usuarioAutenticado.id,
          email: usuarioAutenticado.email,
          senha: usuarioAutenticado.senha,
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        }))
        
        console.log('✅ Login realizado com sucesso:', usuarioAutenticado.nome)
      } else {
        alert('Email ou senha incorretos, ou conta inativa!')
      }
    } catch (error) {
      console.error('❌ Erro no login:', error)
      alert('Erro na conexão. Tente novamente.')
    } finally {
      setCarregandoLogin(false)
    }
  }

  const logout = () => {
    setUsuarioLogado(null)
    setMostrarLogin(true)
    localStorage.removeItem('iptv_sessao_universal')
    console.log('✅ Logout realizado')
  }

  // Função para verificar se usuário tem permissões de admin
  const temPermissoesAdmin = () => {
    return usuarioLogado?.tipo === 'admin'
  }

  // Função para verificar permissões específicas
  const temPermissao = (permissao: string) => {
    return usuarioLogado?.tipo === 'admin'
  }

  // Filtrar dados por usuário
  const clientesFiltrados = clientes
    .filter(cliente => usuarioLogado?.tipo === 'admin' || cliente.usuarioId === usuarioLogado?.id)
    .filter(cliente => {
      const matchBusca = cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
                        cliente.whatsapp.includes(busca)
      const matchStatus = filtroStatus === 'todos' || cliente.status === filtroStatus
      return matchBusca && matchStatus
    })

  const servidoresFiltrados = servidores
    .filter(servidor => usuarioLogado?.tipo === 'admin' || servidor.usuarioId === usuarioLogado?.id)

  // Função para calcular dias até vencimento
  const calcularDiasVencimento = (dataVencimento: string): number => {
    const hoje = new Date()
    const vencimento = new Date(dataVencimento)
    const diffTime = vencimento.getTime() - hoje.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Clientes que vencem nos próximos 3 dias
  const clientesVencendo = clientesFiltrados.filter(cliente => {
    const diasVencimento = calcularDiasVencimento(cliente.dataVencimento)
    return diasVencimento >= 0 && diasVencimento <= 3
  })

  // Clientes vencidos (expirados)
  const clientesVencidos = clientesFiltrados.filter(cliente => {
    const diasVencimento = calcularDiasVencimento(cliente.dataVencimento)
    return diasVencimento < 0
  })

  const estatisticas = {
    totalClientes: clientesFiltrados.length,
    clientesAtivos: clientesFiltrados.filter(c => c.status === 'ativo').length,
    clientesVencidos: clientesVencidos.length,
    clientesVencendo: clientesVencendo.length,
    receitaMensal: clientesFiltrados.filter(c => c.status === 'ativo').reduce((acc, c) => acc + (c.valorMensal || 0), 0)
  }

  // Função para enviar cobrança via WhatsApp
  const enviarCobrancaWhatsApp = (cliente: Cliente) => {
    const diasVencimento = calcularDiasVencimento(cliente.dataVencimento)
    
    let mensagem = configSistema.mensagemCobranca
    mensagem = mensagem.replace('{nome}', cliente.nome)
    mensagem = mensagem.replace('{plano}', cliente.plano)
    mensagem = mensagem.replace('{dias}', diasVencimento.toString())
    mensagem = mensagem.replace('{valor}', cliente.valorMensal.toFixed(2))
    
    const whatsappUrl = `https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`
    window.open(whatsappUrl, '_blank')
  }

  // Função para enviar lembrete via WhatsApp
  const enviarLembreteWhatsApp = (cliente: Cliente) => {
    const diasVencimento = calcularDiasVencimento(cliente.dataVencimento)
    
    let mensagem = ''
    if (diasVencimento < 0) {
      mensagem = `Olá ${cliente.nome}! Seu plano ${cliente.plano} está vencido há ${Math.abs(diasVencimento)} dias. Renove agora para continuar aproveitando nossos serviços! Valor: R$ ${cliente.valorMensal.toFixed(2)}`
    } else {
      mensagem = `Olá ${cliente.nome}! Lembrete: Seu plano ${cliente.plano} vence em ${diasVencimento} dias. Renove antecipadamente e evite interrupções! Valor: R$ ${cliente.valorMensal.toFixed(2)}`
    }
    
    const whatsappUrl = `https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`
    window.open(whatsappUrl, '_blank')
  }

  // Funções de gerenciamento com banco de dados universal
  const adicionarCliente = async (dadosCliente: Omit<Cliente, 'id' | 'dataCadastro' | 'usuarioId'>) => {
    const novoCliente: Cliente = {
      ...dadosCliente,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString().split('T')[0],
      usuarioId: usuarioLogado?.id || ''
    }
    
    setClientes([...clientes, novoCliente])
    await DatabaseAPI.salvarDados('clientes', novoCliente)
    console.log('✅ Cliente adicionado ao Supabase:', novoCliente.nome)
  }

  const editarCliente = async (clienteEditado: Cliente) => {
    setClientes(clientes.map(cliente => 
      cliente.id === clienteEditado.id ? clienteEditado : cliente
    ))
    await DatabaseAPI.atualizarDados('clientes', clienteEditado.id, converterClienteParaSupabase(clienteEditado))
    console.log('✅ Cliente atualizado no Supabase:', clienteEditado.nome)
  }

  const excluirCliente = async (clienteId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      setClientes(clientes.filter(cliente => cliente.id !== clienteId))
      setPagamentos(pagamentos.filter(pagamento => pagamento.clienteId !== clienteId))
      await DatabaseAPI.excluirDados('clientes', clienteId)
      console.log('✅ Cliente excluído do Supabase:', clienteId)
    }
  }

  // Funções de gerenciamento de servidores
  const adicionarServidor = async (dadosServidor: Omit<Servidor, 'id' | 'dataCriacao' | 'usuarioId'>) => {
    const novoServidor: Servidor = {
      ...dadosServidor,
      id: Date.now().toString(),
      dataCriacao: new Date().toISOString(),
      usuarioId: usuarioLogado?.id || ''
    }
    
    setServidores([...servidores, novoServidor])
    await DatabaseAPI.salvarDados('servidores', novoServidor)
    console.log('✅ Servidor adicionado ao Supabase:', novoServidor.nome)
  }

  const editarServidor = async (servidorEditado: Servidor) => {
    setServidores(servidores.map(servidor => 
      servidor.id === servidorEditado.id ? servidorEditado : servidor
    ))
    await DatabaseAPI.atualizarDados('servidores', servidorEditado.id, converterServidorParaSupabase(servidorEditado))
    console.log('✅ Servidor atualizado no Supabase:', servidorEditado.nome)
  }

  const excluirServidor = async (servidorId: string) => {
    if (confirm('Tem certeza que deseja excluir este servidor? Esta ação não pode ser desfeita.')) {
      setServidores(servidores.filter(servidor => servidor.id !== servidorId))
      await DatabaseAPI.excluirDados('servidores', servidorId)
      console.log('✅ Servidor excluído do Supabase:', servidorId)
    }
  }

  const criarBanner = async (dadosBanner: Omit<Banner, 'id' | 'dataCriacao' | 'usuarioId'>) => {
    const novoBanner: Banner = {
      ...dadosBanner,
      id: Date.now().toString(),
      dataCriacao: new Date().toISOString(),
      usuarioId: usuarioLogado?.id || '',
      logoUrl: configSistema.logoUrl
    }
    
    setBanners([...banners, novoBanner])
    await DatabaseAPI.salvarDados('banners', novoBanner)
    console.log('✅ Banner salvo no Supabase:', novoBanner.categoria)
  }

  const excluirBanner = async (bannerId: string) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      setBanners(banners.filter(banner => banner.id !== bannerId))
      await DatabaseAPI.excluirDados('banners', bannerId)
      console.log('✅ Banner excluído do Supabase:', bannerId)
    }
  }

  const alterarCredenciais = async (novoEmail: string, novaSenha: string) => {
    if (usuarioLogado) {
      // Atualizar usuário
      const usuariosAtualizados = usuarios.map(usuario => 
        usuario.id === usuarioLogado.id 
          ? { ...usuario, email: novoEmail, senha: novaSenha }
          : usuario
      )
      setUsuarios(usuariosAtualizados)
      
      // Atualizar usuário logado
      const usuarioAtualizado = { ...usuarioLogado, email: novoEmail, senha: novaSenha }
      setUsuarioLogado(usuarioAtualizado)
      
      // Salvar no banco de dados universal
      await DatabaseAPI.atualizarDados('usuarios', usuarioLogado.id, { email: novoEmail, senha: novaSenha })
      
      // Atualizar sessão universal
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('iptv_sessao_universal', JSON.stringify({
        id: usuarioAtualizado.id,
        email: usuarioAtualizado.email,
        senha: usuarioAtualizado.senha,
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      }))
      
      alert('✅ Credenciais alteradas com sucesso! Agora você pode fazer login de qualquer navegador com as novas credenciais.')
      console.log('✅ Credenciais universais atualizadas para:', novoEmail)
    }
  }

  const atualizarConfig = async (novaConfig: Partial<ConfigSistema>) => {
    const configAtualizada = { ...configSistema, ...novaConfig }
    setConfigSistema(configAtualizada)
    DatabaseAPI.salvarConfiguracao(configAtualizada)
    console.log('✅ Configurações salvas:', configAtualizada)
  }

  const gerenciarUsuario = async (usuarioId: string, acao: 'ativar' | 'desativar' | 'promover' | 'rebaixar' | 'bloquear' | 'desbloquear') => {
    const usuariosAtualizados = usuarios.map(usuario => {
      if (usuario.id === usuarioId) {
        let usuarioAtualizado = { ...usuario }
        switch (acao) {
          case 'ativar':
          case 'desbloquear':
            usuarioAtualizado.ativo = true
            break
          case 'desativar':
          case 'bloquear':
            usuarioAtualizado.ativo = false
            break
          case 'promover':
            usuarioAtualizado.tipo = 'admin'
            break
          case 'rebaixar':
            usuarioAtualizado.tipo = 'usuario'
            break
        }
        DatabaseAPI.atualizarDados('usuarios', usuarioId, converterUsuarioParaSupabase(usuarioAtualizado))
        return usuarioAtualizado
      }
      return usuario
    })
    setUsuarios(usuariosAtualizados)
    
    // Mensagem de confirmação
    const acaoTexto = {
      'ativar': 'ativado',
      'desativar': 'desativado',
      'bloquear': 'bloqueado',
      'desbloquear': 'desbloqueado',
      'promover': 'promovido a administrador',
      'rebaixar': 'rebaixado a usuário comum'
    }
    
    const usuario = usuarios.find(u => u.id === usuarioId)
    alert(`✅ Usuário ${usuario?.nome} foi ${acaoTexto[acao]} com sucesso!`)
  }

  const criarNovoUsuario = async (dadosUsuario: Omit<Usuario, 'id' | 'dataCadastro' | 'ultimoAcesso'>) => {
    const novoUsuario: Usuario = {
      ...dadosUsuario,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString(),
      ultimoAcesso: new Date().toISOString()
    }
    
    setUsuarios([...usuarios, novoUsuario])
    await DatabaseAPI.salvarDados('usuarios', novoUsuario)
    console.log('✅ Novo usuário criado no Supabase:', novoUsuario.nome)
    alert(`✅ Usuário criado com sucesso!\n\n📧 Login: ${novoUsuario.email}\n🔑 Senha: ${novoUsuario.senha}\n\n🌐 O usuário pode fazer login em QUALQUER NAVEGADOR com essas credenciais.\n💾 Dados salvos no Supabase para acesso universal.`)
  }

  const editarUsuario = async (usuarioEditado: Usuario) => {
    setUsuarios(usuarios.map(usuario => 
      usuario.id === usuarioEditado.id ? usuarioEditado : usuario
    ))
    await DatabaseAPI.atualizarDados('usuarios', usuarioEditado.id, converterUsuarioParaSupabase(usuarioEditado))
    console.log('✅ Usuário atualizado no Supabase:', usuarioEditado.nome)
    alert(`✅ Usuário atualizado com sucesso!\n\n📧 Novo Login: ${usuarioEditado.email}\n🔑 Nova Senha: ${usuarioEditado.senha}\n\n🌐 As novas credenciais funcionam em qualquer navegador.`)
  }

  const excluirUsuario = async (usuarioId: string) => {
    if (usuarioId === usuarioLogado?.id) {
      alert('❌ Você não pode excluir sua própria conta!')
      return
    }
    
    const usuario = usuarios.find(u => u.id === usuarioId)
    if (confirm(`⚠️ Tem certeza que deseja excluir o usuário "${usuario?.nome}"?\n\n❌ Esta ação não pode ser desfeita.\n🗑️ Todos os dados do usuário serão removidos permanentemente.`)) {
      setUsuarios(usuarios.filter(usuario => usuario.id !== usuarioId))
      await DatabaseAPI.excluirDados('usuarios', usuarioId)
      console.log('✅ Usuário excluído do Supabase:', usuarioId)
      alert('✅ Usuário excluído com sucesso!')
    }
  }

  // Tela de Login Futurista
  if (mostrarLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Grid de fundo futurista */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,69,19,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(139,69,19,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        
        {/* Efeitos de luz */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <CardHeader className="text-center space-y-6">
              {/* Logo futurista */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
                    {configSistema.logoUrl ? (
                      <img src={configSistema.logoUrl} alt="Logo" className="w-12 h-12 rounded-full" />
                    ) : (
                      <Tv className="w-12 h-12 text-white" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Título futurista */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  {configSistema.nomeSistema}
                </h1>
                <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              </div>
              
              {/* Indicador de Status da Conexão */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full ${
                  statusConexao === 'online' ? 'bg-green-400' :
                  statusConexao === 'sincronizando' ? 'bg-yellow-400 animate-pulse' :
                  'bg-red-400'
                }`}></div>
                <span className="text-xs text-gray-300">
                  {statusConexao === 'online' && (
                    <>
                      <Database className="w-3 h-3 inline mr-1" />
                      Sistema Supabase Online
                    </>
                  )}
                  {statusConexao === 'sincronizando' && (
                    <>
                      <Cloud className="w-3 h-3 inline mr-1 animate-spin" />
                      Sincronizando com Supabase...
                    </>
                  )}
                  {statusConexao === 'offline' && (
                    <>
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Modo offline
                    </>
                  )}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <LoginForm onLogin={fazerLogin} carregando={carregandoLogin} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Interface principal simplificada para focar no essencial
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 py-4">
          <div className="flex items-center gap-4">
            {configSistema.logoUrl && (
              <img src={configSistema.logoUrl} alt="Logo" className="w-12 h-12 rounded-lg" />
            )}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                <Tv className="w-6 lg:w-8 h-6 lg:h-8 text-purple-400" />
                {configSistema.nomeSistema}
              </h1>
              <p className="text-purple-200 text-sm lg:text-base">
                Bem-vindo, {usuarioLogado?.nome} 
                {usuarioLogado?.tipo === 'admin' && <Crown className="inline w-4 h-4 ml-2 text-yellow-400" />}
              </p>
              
              {/* Indicador de Status da Conexão no Header */}
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  statusConexao === 'online' ? 'bg-green-400' :
                  statusConexao === 'sincronizando' ? 'bg-yellow-400 animate-pulse' :
                  'bg-red-400'
                }`}></div>
                <span className="text-xs text-gray-400">
                  {statusConexao === 'online' && 'Sistema Supabase Ativo'}
                  {statusConexao === 'sincronizando' && 'Sincronizando...'}
                  {statusConexao === 'offline' && 'Modo offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setModalAlterarCredenciais(true)}
              className="border-white/20 text-white hover:bg-white/10 text-xs lg:text-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Alterar Credenciais
            </Button>
            
            {temPermissao('usuarios') && (
              <Button
                variant="outline"
                onClick={() => setModalUsuarios(true)}
                className="border-white/20 text-white hover:bg-white/10 text-xs lg:text-sm"
              >
                <Shield className="w-4 h-4 mr-2" />
                Gerenciar Usuários
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={logout}
              className="border-red-500/50 text-red-400 hover:bg-red-500/20 text-xs lg:text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          <Card className="bg-[#87CEEB]/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-white">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-white">{estatisticas.totalClientes}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#87CEEB]/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-white">Clientes Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-green-400">{estatisticas.clientesAtivos}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#87CEEB]/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-white">Vencendo (3 dias)</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-yellow-400">{estatisticas.clientesVencendo}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#87CEEB]/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-white">Clientes Vencidos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-red-400">{estatisticas.clientesVencidos}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#87CEEB]/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium text-white">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg lg:text-2xl font-bold text-green-400">
                R$ {estatisticas.receitaMensal.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs defaultValue="clientes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-[#87CEEB]/10 backdrop-blur-sm">
            <TabsTrigger value="clientes" className="text-white data-[state=active]:bg-purple-600 text-xs lg:text-sm">
              Clientes
            </TabsTrigger>
            <TabsTrigger value="vencendo" className="text-white data-[state=active]:bg-yellow-600 text-xs lg:text-sm">
              Vencendo (3d)
            </TabsTrigger>
            <TabsTrigger value="vencidos" className="text-white data-[state=active]:bg-red-600 text-xs lg:text-sm">
              Vencidos
            </TabsTrigger>
            <TabsTrigger value="servidores" className="text-white data-[state=active]:bg-purple-600 text-xs lg:text-sm">
              Servidores
            </TabsTrigger>
            <TabsTrigger value="banners" className="text-white data-[state=active]:bg-purple-600 text-xs lg:text-sm">
              Banners
            </TabsTrigger>
          </TabsList>

          {/* Tab Clientes */}
          <TabsContent value="clientes" className="space-y-6">
            <Card className="bg-[#87CEEB]/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <CardTitle className="text-white">Gerenciar Clientes</CardTitle>
                  </div>
                  
                  <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-xs lg:text-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Cliente
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                        <DialogDescription className="text-slate-300">
                          Preencha os dados do cliente para cadastro no Supabase
                        </DialogDescription>
                      </DialogHeader>
                      <NovoClienteForm onSubmit={adicionarCliente} onClose={() => setModalAberto(false)} />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Filtros */}
                <div className="flex flex-col lg:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou WhatsApp..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10 bg-[#87CEEB]/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-full lg:w-48 bg-[#87CEEB]/10 border-white/20 text-white">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="suspenso">Suspenso</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {clientesFiltrados.map((cliente) => (
                    <Card key={cliente.id} className="bg-[#87CEEB]/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                              <h3 className="font-semibold text-white text-base lg:text-lg">{cliente.nome}</h3>
                              <Badge className={getStatusColor(cliente.status)}>
                                {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm text-gray-300">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                WhatsApp: {cliente.whatsapp}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Vence: {new Date(cliente.dataVencimento).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-sm">
                              <span className="text-purple-300">Plano: {cliente.plano}</span>
                              <span className="text-green-300">R$ {(cliente.valorMensal || 0).toFixed(2)}/mês</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => enviarLembreteWhatsApp(cliente)}
                              className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                              title="Enviar lembrete via WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setClienteSelecionado(cliente)}
                              className="border-white/20 text-white hover:bg-white/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setClienteEditando(cliente)
                                setModalEditarCliente(true)
                              }}
                              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => excluirCliente(cliente.id)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Clientes Vencendo */}
          <TabsContent value="vencendo" className="space-y-6">
            <Card className="bg-yellow-500/10 backdrop-blur-sm border-yellow-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  Clientes Vencendo nos Próximos 3 Dias
                </CardTitle>
                <CardDescription className="text-yellow-200">
                  {clientesVencendo.length} clientes precisam renovar em breve
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {clientesVencendo.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum cliente vencendo nos próximos 3 dias.</p>
                    </div>
                  ) : (
                    clientesVencendo.map((cliente) => {
                      const diasVencimento = calcularDiasVencimento(cliente.dataVencimento)
                      return (
                        <Card key={cliente.id} className="bg-yellow-500/5 border-yellow-500/20">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                                  <h3 className="font-semibold text-white text-base lg:text-lg">{cliente.nome}</h3>
                                  <Badge className="bg-yellow-500 text-black">
                                    Vence em {diasVencimento} dia{diasVencimento !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm text-gray-300">
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    WhatsApp: {cliente.whatsapp}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Vence: {new Date(cliente.dataVencimento).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-sm">
                                  <span className="text-purple-300">Plano: {cliente.plano}</span>
                                  <span className="text-green-300">R$ {(cliente.valorMensal || 0).toFixed(2)}/mês</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => enviarLembreteWhatsApp(cliente)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Enviar Lembrete
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setClienteEditando(cliente)
                                    setModalEditarCliente(true)
                                  }}
                                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Clientes Vencidos */}
          <TabsContent value="vencidos" className="space-y-6">
            <Card className="bg-red-500/10 backdrop-blur-sm border-red-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Clientes com Planos Vencidos
                </CardTitle>
                <CardDescription className="text-red-200">
                  {clientesVencidos.length} clientes com planos expirados
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {clientesVencidos.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum cliente com plano vencido.</p>
                    </div>
                  ) : (
                    clientesVencidos.map((cliente) => {
                      const diasVencidos = Math.abs(calcularDiasVencimento(cliente.dataVencimento))
                      return (
                        <Card key={cliente.id} className="bg-red-500/5 border-red-500/20">
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                                  <h3 className="font-semibold text-white text-base lg:text-lg">{cliente.nome}</h3>
                                  <Badge className="bg-red-500 text-white">
                                    Vencido há {diasVencidos} dia{diasVencidos !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 text-sm text-gray-300">
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    WhatsApp: {cliente.whatsapp}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Venceu: {new Date(cliente.dataVencimento).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 text-sm">
                                  <span className="text-purple-300">Plano: {cliente.plano}</span>
                                  <span className="text-green-300">R$ {(cliente.valorMensal || 0).toFixed(2)}/mês</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => enviarLembreteWhatsApp(cliente)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Cobrar Renovação
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setClienteEditando(cliente)
                                    setModalEditarCliente(true)
                                  }}
                                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => excluirCliente(cliente.id)}
                                  className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Servidores */}
          <TabsContent value="servidores" className="space-y-6">
            <Card className="bg-[#87CEEB]/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <CardTitle className="text-white">Gerenciar Servidores</CardTitle>
                  </div>
                  
                  <Dialog open={modalServidor} onOpenChange={setModalServidor}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-xs lg:text-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Servidor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Novo Servidor</DialogTitle>
                        <DialogDescription className="text-slate-300">
                          Preencha os dados do servidor para cadastro no Supabase
                        </DialogDescription>
                      </DialogHeader>
                      <NovoServidorForm onSubmit={adicionarServidor} onClose={() => setModalServidor(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {servidoresFiltrados.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum servidor cadastrado ainda.</p>
                    </div>
                  ) : (
                    servidoresFiltrados.map((servidor) => (
                      <Card key={servidor.id} className="bg-[#87CEEB]/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                                <h3 className="font-semibold text-white text-base lg:text-lg">{servidor.nome}</h3>
                                <Badge className={servidor.ativo ? 'bg-green-500' : 'bg-red-500'}>
                                  {servidor.ativo ? 'Ativo' : 'Inativo'}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-300">
                                <div className="flex items-center gap-2">
                                  <Link className="w-4 h-4" />
                                  <a 
                                    href={servidor.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline break-all flex items-center gap-1"
                                  >
                                    {servidor.link}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                                {servidor.descricao && (
                                  <p className="text-gray-400">{servidor.descricao}</p>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                Criado em: {new Date(servidor.dataCriacao).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setServidorEditando(servidor)
                                  setModalEditarServidor(true)
                                }}
                                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => excluirServidor(servidor.id)}
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Banners */}
          <TabsContent value="banners" className="space-y-6">
            <Card className="bg-[#87CEEB]/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <CardTitle className="text-white">Gerador de Banners</CardTitle>
                    <CardDescription className="text-purple-200">
                      Crie banners profissionais
                    </CardDescription>
                  </div>
                  
                  <Dialog open={modalBanner} onOpenChange={setModalBanner}>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-xs lg:text-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Banner
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Banner</DialogTitle>
                        <DialogDescription className="text-slate-300">
                          Crie banners personalizados
                        </DialogDescription>
                      </DialogHeader>
                      <BannerForm 
                        onSubmit={criarBanner} 
                        onClose={() => setModalBanner(false)}
                        usuarioLogado={usuarioLogado}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {banners
                    .filter(banner => usuarioLogado?.tipo === 'admin' || banner.usuarioId === usuarioLogado?.id)
                    .map((banner) => (
                    <Card key={banner.id} className="bg-[#87CEEB]/5 border-white/10 overflow-hidden">
                      <div className="relative">
                        {banner.imagemUrl && (
                          <img 
                            src={banner.imagemUrl} 
                            alt="Banner"
                            className="w-full h-32 lg:h-48 object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Badge className={
                            banner.categoria === 'filme' ? 'bg-red-500' :
                            banner.categoria === 'serie' ? 'bg-blue-500' : 'bg-green-500'
                          }>
                            {banner.categoria === 'filme' && <Film className="w-3 h-3 mr-1" />}
                            {banner.categoria === 'serie' && <Monitor className="w-3 h-3 mr-1" />}
                            {banner.categoria === 'esporte' && <Trophy className="w-3 h-3 mr-1" />}
                            {banner.categoria.charAt(0).toUpperCase() + banner.categoria.slice(1)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => excluirBanner(banner.id)}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20 p-1 h-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        {banner.logoUrl && (
                          <img 
                            src={banner.logoUrl} 
                            alt="Logo"
                            className="absolute bottom-2 left-2 w-8 lg:w-12 h-8 lg:h-12 rounded bg-white/20 backdrop-blur-sm p-1"
                          />
                        )}
                      </div>
                      <CardContent className="p-3 lg:p-4">
                        {banner.sinopse && (
                          <p className="text-xs text-gray-400 mb-2 line-clamp-2">{banner.sinopse}</p>
                        )}
                        {banner.dataEvento && (
                          <p className="text-xs text-purple-300 mb-4">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {new Date(banner.dataEvento).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        <Button 
                          size="sm" 
                          className="w-full bg-purple-600 hover:bg-purple-700 text-xs lg:text-sm"
                          onClick={() => {
                            // Simular download
                            const link = document.createElement('a')
                            link.href = banner.imagemUrl
                            link.download = `banner-${banner.categoria}-${Date.now()}.jpg`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Banner
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais */}
        {clienteSelecionado && (
          <Dialog open={!!clienteSelecionado} onOpenChange={() => setClienteSelecionado(null)}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalhes do Cliente</DialogTitle>
              </DialogHeader>
              <ClienteDetalhes cliente={clienteSelecionado} />
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de Editar Cliente */}
        <Dialog open={modalEditarCliente} onOpenChange={setModalEditarCliente}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription className="text-slate-300">
                Altere os dados do cliente (salvos no Supabase)
              </DialogDescription>
            </DialogHeader>
            {clienteEditando && (
              <EditarClienteForm 
                cliente={clienteEditando}
                onSubmit={(clienteEditado) => {
                  editarCliente(clienteEditado)
                  setModalEditarCliente(false)
                  setClienteEditando(null)
                }}
                onClose={() => {
                  setModalEditarCliente(false)
                  setClienteEditando(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Editar Servidor */}
        <Dialog open={modalEditarServidor} onOpenChange={setModalEditarServidor}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Servidor</DialogTitle>
              <DialogDescription className="text-slate-300">
                Altere os dados do servidor (salvos no Supabase)
              </DialogDescription>
            </DialogHeader>
            {servidorEditando && (
              <EditarServidorForm 
                servidor={servidorEditando}
                onSubmit={(servidorEditado) => {
                  editarServidor(servidorEditado)
                  setModalEditarServidor(false)
                  setServidorEditando(null)
                }}
                onClose={() => {
                  setModalEditarServidor(false)
                  setServidorEditando(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Alterar Credenciais */}
        <Dialog open={modalAlterarCredenciais} onOpenChange={setModalAlterarCredenciais}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Alterar Credenciais</DialogTitle>
              <DialogDescription className="text-slate-300">
                Altere seu email e senha de acesso (salvo no Supabase para uso em qualquer navegador)
              </DialogDescription>
            </DialogHeader>
            <AlterarCredenciaisForm 
              usuarioAtual={usuarioLogado}
              onSubmit={alterarCredenciais} 
              onClose={() => setModalAlterarCredenciais(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* Modal de Usuários (Admin) */}
        {temPermissao('usuarios') && (
          <Dialog open={modalUsuarios} onOpenChange={setModalUsuarios}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <DialogTitle className="text-xl">🔐 Gerenciar Usuários do Sistema</DialogTitle>
                    <DialogDescription className="text-slate-300 mt-2">
                      Controle total dos usuários - Crie novos usuários com login e senha funcionais em qualquer navegador
                    </DialogDescription>
                  </div>
                  <Button
                    onClick={() => setModalCriarUsuario(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Usuário
                  </Button>
                </div>
              </DialogHeader>
              <UsuariosManager 
                usuarios={usuarios} 
                onGerenciar={gerenciarUsuario}
                onEditar={(usuario) => {
                  setUsuarioEditando(usuario)
                  setModalEditarUsuario(true)
                }}
                onExcluir={excluirUsuario}
                usuarioAtual={usuarioLogado}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de Criar Usuário */}
        <Dialog open={modalCriarUsuario} onOpenChange={setModalCriarUsuario}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>🆕 Criar Novo Usuário</DialogTitle>
              <DialogDescription className="text-slate-300">
                Crie um novo usuário com login e senha funcionais para qualquer navegador
              </DialogDescription>
            </DialogHeader>
            <CriarUsuarioForm 
              onSubmit={(dadosUsuario) => {
                criarNovoUsuario(dadosUsuario)
                setModalCriarUsuario(false)
              }}
              onClose={() => setModalCriarUsuario(false)} 
            />
          </DialogContent>
        </Dialog>

        {/* Modal de Editar Usuário */}
        <Dialog open={modalEditarUsuario} onOpenChange={setModalEditarUsuario}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>✏️ Editar Usuário</DialogTitle>
              <DialogDescription className="text-slate-300">
                Altere os dados do usuário (salvos no Supabase)
              </DialogDescription>
            </DialogHeader>
            {usuarioEditando && (
              <EditarUsuarioForm 
                usuario={usuarioEditando}
                onSubmit={(usuarioEditado) => {
                  editarUsuario(usuarioEditado)
                  setModalEditarUsuario(false)
                  setUsuarioEditando(null)
                }}
                onClose={() => {
                  setModalEditarUsuario(false)
                  setUsuarioEditando(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Componentes auxiliares
function LoginForm({ onLogin, carregando }: {
  onLogin: (email: string, senha: string) => void
  carregando: boolean
}) {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(formData.email, formData.senha)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-white text-sm font-medium">Login</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="bg-black/20 border border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
            placeholder="Digite seu login"
            required
            disabled={carregando}
          />
        </div>
        
        <div>
          <Label htmlFor="senha" className="text-white text-sm font-medium">Senha</Label>
          <Input
            id="senha"
            type="password"
            value={formData.senha}
            onChange={(e) => setFormData({...formData, senha: e.target.value})}
            className="bg-black/20 border border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
            placeholder="Digite sua senha"
            required
            disabled={carregando}
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25" 
        disabled={carregando}
      >
        {carregando ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <Database className="w-4 h-4 mr-2" />
            Entrar
          </>
        )}
      </Button>
      
      <div className="text-center text-xs text-gray-400 mt-4 space-y-1">
        <p>🔐 Sistema Supabase - Funciona em qualquer navegador</p>
        <p>🌐 Suas credenciais são salvas no banco de dados</p>
      </div>
    </form>
  )
}

function CriarUsuarioForm({ onSubmit, onClose }: {
  onSubmit: (usuario: Omit<Usuario, 'id' | 'dataCadastro' | 'ultimoAcesso'>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: 'usuario' as Usuario['tipo'],
    ativo: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.senha !== formData.confirmarSenha) {
      alert('❌ As senhas não coincidem!')
      return
    }
    
    if (formData.senha.length < 6) {
      alert('❌ A senha deve ter pelo menos 6 caracteres!')
      return
    }
    
    onSubmit({
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      tipo: formData.tipo,
      ativo: formData.ativo
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3 text-green-200 text-sm">
          <UserPlus className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">🌐 Acesso Universal Garantido</p>
            <p>O usuário poderá fazer login em <strong>qualquer navegador</strong> com as credenciais criadas.</p>
            <p className="mt-1">💾 Dados salvos no Supabase para acesso global.</p>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="nome" className="text-white">Nome Completo</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Digite o nome completo"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email" className="text-white">Email (Login)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="usuario@exemplo.com"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="senha" className="text-white">Senha</Label>
        <Input
          id="senha"
          type="password"
          value={formData.senha}
          onChange={(e) => setFormData({...formData, senha: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="confirmarSenha" className="text-white">Confirmar Senha</Label>
        <Input
          id="confirmarSenha"
          type="password"
          value={formData.confirmarSenha}
          onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Digite a senha novamente"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="tipo" className="text-white">Tipo de Usuário</Label>
        <Select value={formData.tipo} onValueChange={(value: Usuario['tipo']) => setFormData({...formData, tipo: value})}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="usuario">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuário Comum
              </div>
            </SelectItem>
            <SelectItem value="admin">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Administrador
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="ativo"
          checked={formData.ativo}
          onCheckedChange={(checked) => setFormData({...formData, ativo: checked as boolean})}
        />
        <Label htmlFor="ativo" className="text-white">Usuário ativo (pode fazer login)</Label>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Criar Usuário
        </Button>
      </div>
    </form>
  )
}

function EditarUsuarioForm({ usuario, onSubmit, onClose }: {
  usuario: Usuario
  onSubmit: (usuario: Usuario) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    ...usuario,
    confirmarSenha: usuario.senha
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.senha !== formData.confirmarSenha) {
      alert('❌ As senhas não coincidem!')
      return
    }
    
    if (formData.senha.length < 6) {
      alert('❌ A senha deve ter pelo menos 6 caracteres!')
      return
    }
    
    onSubmit({
      id: formData.id,
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      tipo: formData.tipo,
      ativo: formData.ativo,
      dataCadastro: formData.dataCadastro,
      ultimoAcesso: formData.ultimoAcesso
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3 text-blue-200 text-sm">
          <Edit className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">🔄 Atualização Universal</p>
            <p>As novas credenciais funcionarão em <strong>qualquer navegador</strong>.</p>
            <p className="mt-1">💾 Alterações salvas no Supabase automaticamente.</p>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="nome" className="text-white">Nome Completo</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({...formData, nome: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email" className="text-white">Email (Login)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="senha" className="text-white">Nova Senha</Label>
        <Input
          id="senha"
          type="password"
          value={formData.senha}
          onChange={(e) => setFormData({...formData, senha: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="confirmarSenha" className="text-white">Confirmar Nova Senha</Label>
        <Input
          id="confirmarSenha"
          type="password"
          value={formData.confirmarSenha}
          onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="tipo" className="text-white">Tipo de Usuário</Label>
        <Select value={formData.tipo} onValueChange={(value: Usuario['tipo']) => setFormData({...formData, tipo: value})}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="usuario">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuário Comum
              </div>
            </SelectItem>
            <SelectItem value="admin">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Administrador
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="ativo"
          checked={formData.ativo}
          onCheckedChange={(checked) => setFormData({...formData, ativo: checked as boolean})}
        />
        <Label htmlFor="ativo" className="text-white">Usuário ativo (pode fazer login)</Label>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Atualizar Usuário
        </Button>
      </div>
    </form>
  )
}

function AlterarCredenciaisForm({ usuarioAtual, onSubmit, onClose }: {
  usuarioAtual: Usuario | null
  onSubmit: (email: string, senha: string) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    email: usuarioAtual?.email || '',
    senha: '',
    confirmarSenha: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.senha !== formData.confirmarSenha) {
      alert('❌ As senhas não coincidem!')
      return
    }
    
    if (formData.senha.length < 6) {
      alert('❌ A senha deve ter pelo menos 6 caracteres!')
      return
    }
    
    onSubmit(formData.email, formData.senha)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-blue-200 text-sm">
          <Database className="w-4 h-4" />
          <span>Suas novas credenciais serão salvas no Supabase e funcionarão em qualquer navegador</span>
        </div>
      </div>
      
      <div>
        <Label htmlFor="email" className="text-white">Novo Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="senha" className="text-white">Nova Senha</Label>
        <Input
          id="senha"
          type="password"
          value={formData.senha}
          onChange={(e) => setFormData({...formData, senha: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="confirmarSenha" className="text-white">Confirmar Nova Senha</Label>
        <Input
          id="confirmarSenha"
          type="password"
          value={formData.confirmarSenha}
          onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          required
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          <Database className="w-4 h-4 mr-2" />
          Salvar no Supabase
        </Button>
      </div>
    </form>
  )
}

function NovoClienteForm({ onSubmit, onClose }: { 
  onSubmit: (cliente: Omit<Cliente, 'id' | 'dataCadastro' | 'usuarioId'>) => void
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    plano: '',
    status: 'ativo' as Cliente['status'],
    dataVencimento: '',
    valorMensal: 0,
    dataUltimoPagamento: '',
    observacoes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="(11) 99999-9999"
            required
          />
        </div>
        <div>
          <Label htmlFor="plano">Plano</Label>
          <Input
            id="plano"
            value={formData.plano}
            onChange={(e) => setFormData({...formData, plano: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="Digite o nome do plano"
            required
          />
        </div>
        <div>
          <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
          <Input
            id="valorMensal"
            type="number"
            step="0.01"
            value={formData.valorMensal}
            onChange={(e) => setFormData({...formData, valorMensal: parseFloat(e.target.value) || 0})}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="dataVencimento">Data de Vencimento</Label>
          <Input
            id="dataVencimento"
            type="date"
            value={formData.dataVencimento}
            onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          <Database className="w-4 h-4 mr-2" />
          Salvar no Supabase
        </Button>
      </div>
    </form>
  )
}

function NovoServidorForm({ onSubmit, onClose }: { 
  onSubmit: (servidor: Omit<Servidor, 'id' | 'dataCriacao' | 'usuarioId'>) => void
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    nome: '',
    link: '',
    descricao: '',
    ativo: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Servidor</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="Ex: Servidor Principal"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="link">Link do Servidor</Label>
          <Input
            id="link"
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="https://exemplo.com/servidor"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="Descrição do servidor..."
            rows={3}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="ativo"
            checked={formData.ativo}
            onCheckedChange={(checked) => setFormData({...formData, ativo: checked as boolean})}
          />
          <Label htmlFor="ativo" className="text-white">Servidor ativo</Label>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          <Server className="w-4 h-4 mr-2" />
          Salvar no Supabase
        </Button>
      </div>
    </form>
  )
}

function EditarServidorForm({ servidor, onSubmit, onClose }: {
  servidor: Servidor
  onSubmit: (servidor: Servidor) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    ...servidor
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Servidor</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="link">Link do Servidor</Label>
          <Input
            id="link"
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({...formData, link: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            rows={3}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="ativo"
            checked={formData.ativo}
            onCheckedChange={(checked) => setFormData({...formData, ativo: checked as boolean})}
          />
          <Label htmlFor="ativo" className="text-white">Servidor ativo</Label>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Atualizar no Supabase
        </Button>
      </div>
    </form>
  )
}

function EditarClienteForm({ cliente, onSubmit, onClose }: {
  cliente: Cliente
  onSubmit: (cliente: Cliente) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    ...cliente
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome Completo</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({...formData, nome: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            value={formData.whatsapp}
            onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="(11) 99999-9999"
            required
          />
        </div>
        <div>
          <Label htmlFor="plano">Plano</Label>
          <Input
            id="plano"
            value={formData.plano}
            onChange={(e) => setFormData({...formData, plano: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="Digite o nome do plano"
            required
          />
        </div>
        <div>
          <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
          <Input
            id="valorMensal"
            type="number"
            step="0.01"
            value={formData.valorMensal || 0}
            onChange={(e) => setFormData({...formData, valorMensal: parseFloat(e.target.value) || 0})}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: Cliente['status']) => setFormData({...formData, status: value})}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dataVencimento">Data de Vencimento</Label>
          <Input
            id="dataVencimento"
            type="date"
            value={formData.dataVencimento}
            onChange={(e) => setFormData({...formData, dataVencimento: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="dataUltimoPagamento">Data do Último Pagamento</Label>
          <Input
            id="dataUltimoPagamento"
            type="date"
            value={formData.dataUltimoPagamento}
            onChange={(e) => setFormData({...formData, dataUltimoPagamento: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Atualizar no Supabase
        </Button>
      </div>
    </form>
  )
}

function BannerForm({ onSubmit, onClose, usuarioLogado }: {
  onSubmit: (banner: Omit<Banner, 'id' | 'dataCriacao' | 'usuarioId' | 'logoUrl'>) => void
  onClose: () => void
  usuarioLogado: Usuario | null
}) {
  const [formData, setFormData] = useState({
    categoria: 'filme' as Banner['categoria'],
    imagemUrl: '',
    sinopse: '',
    dataEvento: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const handleImagemDispositivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setFormData(prev => ({ ...prev, imagemUrl: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="categoria">Categoria</Label>
        <Select onValueChange={(value) => setFormData({...formData, categoria: value as Banner['categoria']})}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="filme">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4" />
                Filme
              </div>
            </SelectItem>
            <SelectItem value="serie">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Série
              </div>
            </SelectItem>
            <SelectItem value="esporte">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Esporte
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>📱 Enviar Imagem do Dispositivo</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleImagemDispositivo}
          className="bg-slate-700 border-slate-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2"
        />
      </div>

      <div>
        <Label>URL da Imagem</Label>
        <Input
          value={formData.imagemUrl}
          onChange={(e) => setFormData({...formData, imagemUrl: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="URL da imagem ou use upload acima"
        />
      </div>

      <div>
        <Label htmlFor="sinopse">Sinopse</Label>
        <Textarea
          id="sinopse"
          value={formData.sinopse}
          onChange={(e) => setFormData({...formData, sinopse: e.target.value})}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Descrição do conteúdo..."
          rows={4}
        />
      </div>

      {formData.categoria === 'esporte' && (
        <div>
          <Label htmlFor="dataEvento">Data do Evento</Label>
          <Input
            id="dataEvento"
            type="date"
            value={formData.dataEvento}
            onChange={(e) => setFormData({...formData, dataEvento: e.target.value})}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      )}
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          <Image className="w-4 h-4 mr-2" />
          Salvar no Supabase
        </Button>
      </div>
    </form>
  )
}

function UsuariosManager({ usuarios, onGerenciar, onEditar, onExcluir, usuarioAtual }: {
  usuarios: Usuario[]
  onGerenciar: (usuarioId: string, acao: 'ativar' | 'desativar' | 'promover' | 'rebaixar' | 'bloquear' | 'desbloquear') => void
  onEditar: (usuario: Usuario) => void
  onExcluir: (usuarioId: string) => void
  usuarioAtual: Usuario | null
}) {
  return (
    <div className="space-y-4">
      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3 text-green-200 text-sm">
          <UserPlus className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">🌐 Sistema de Usuários Universal</p>
            <p>• Todos os usuários criados podem fazer login em <strong>qualquer navegador</strong></p>
            <p>• Credenciais salvas no Supabase para acesso global</p>
            <p>• Gerenciamento completo: criar, editar, bloquear e excluir</p>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4">
        {usuarios.map((usuario) => (
          <Card key={usuario.id} className="bg-[#87CEEB]/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white text-lg">{usuario.nome}</h3>
                    {usuario.tipo === 'admin' && <Crown className="w-5 h-5 text-yellow-400" />}
                    <Badge className={usuario.ativo ? 'bg-green-500' : 'bg-red-500'}>
                      {usuario.ativo ? '✅ Ativo' : '🚫 Bloqueado'}
                    </Badge>
                    <Badge variant="outline" className="text-white border-white/30">
                      {usuario.tipo === 'admin' ? '👑 Admin' : '👤 Usuário'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-300">
                      <strong>📧 Login:</strong> {usuario.email}
                    </p>
                    <p className="text-sm text-gray-300">
                      <strong>🔑 Senha:</strong> {usuario.senha}
                    </p>
                    <p className="text-xs text-gray-400">
                      📅 Cadastro: {new Date(usuario.dataCadastro).toLocaleDateString('pt-BR')} • 
                      🕒 Último acesso: {new Date(usuario.ultimoAcesso).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                {usuario.id !== usuarioAtual?.id && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditar(usuario)}
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                      title="Editar usuário"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onGerenciar(usuario.id, usuario.ativo ? 'bloquear' : 'desbloquear')}
                      className={usuario.ativo ? 'border-red-500/50 text-red-400 hover:bg-red-500/20' : 'border-green-500/50 text-green-400 hover:bg-green-500/20'}
                      title={usuario.ativo ? 'Bloquear usuário' : 'Desbloquear usuário'}
                    >
                      {usuario.ativo ? <Lock className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onGerenciar(usuario.id, usuario.tipo === 'admin' ? 'rebaixar' : 'promover')}
                      className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                      title={usuario.tipo === 'admin' ? 'Rebaixar para usuário comum' : 'Promover para administrador'}
                    >
                      {usuario.tipo === 'admin' ? <Users className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onExcluir(usuario.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                      title="Excluir usuário permanentemente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {usuario.id === usuarioAtual?.id && (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                    👤 Você
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ClienteDetalhes({ cliente }: { cliente: Cliente }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label className="text-gray-300">Nome</Label>
          <p className="text-white font-medium">{cliente.nome}</p>
        </div>
        <div>
          <Label className="text-gray-300">Status</Label>
          <div className="mt-1">
            <Badge className={getStatusColor(cliente.status)}>
              {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div>
          <Label className="text-gray-300">WhatsApp</Label>
          <p className="text-white">{cliente.whatsapp}</p>
        </div>
        <div>
          <Label className="text-gray-300">Plano</Label>
          <p className="text-white">{cliente.plano}</p>
        </div>
        <div>
          <Label className="text-gray-300">Valor Mensal</Label>
          <p className="text-green-400 font-bold">R$ {(cliente.valorMensal || 0).toFixed(2)}</p>
        </div>
        <div>
          <Label className="text-gray-300">Data de Vencimento</Label>
          <p className="text-white">{new Date(cliente.dataVencimento).toLocaleDateString('pt-BR')}</p>
        </div>
        <div>
          <Label className="text-gray-300">Último Pagamento</Label>
          <p className="text-white">{new Date(cliente.dataUltimoPagamento).toLocaleDateString('pt-BR')}</p>
        </div>
        <div>
          <Label className="text-gray-300">Data de Cadastro</Label>
          <p className="text-white">{new Date(cliente.dataCadastro).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div>
        <Label className="text-gray-300">Observações</Label>
        <p className="text-white">{cliente.observacoes}</p>
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'ativo': return 'bg-green-500 hover:bg-green-600'
    case 'vencido': return 'bg-red-500 hover:bg-red-600'
    case 'suspenso': return 'bg-yellow-500 hover:bg-yellow-600'
    case 'inativo': return 'bg-gray-500 hover:bg-gray-600'
    default: return 'bg-gray-500'
  }
}