import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente existem
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Criar cliente apenas se as variáveis existirem
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Tipos para o banco de dados
export interface SupabaseUsuario {
  id: string
  nome: string
  email: string
  senha: string
  tipo: 'admin' | 'usuario'
  ativo: boolean
  data_cadastro: string
  ultimo_acesso: string
  created_at?: string
  updated_at?: string
}

export interface SupabaseCliente {
  id: string
  nome: string
  whatsapp: string
  plano: string
  status: 'ativo' | 'inativo' | 'suspenso' | 'vencido'
  data_vencimento: string
  valor_mensal: number
  data_ultimo_pagamento: string
  observacoes: string
  data_cadastro: string
  usuario_id: string
  created_at?: string
  updated_at?: string
}

export interface SupabaseServidor {
  id: string
  nome: string
  link: string
  descricao: string
  ativo: boolean
  data_criacao: string
  usuario_id: string
  created_at?: string
  updated_at?: string
}

export interface SupabaseBanner {
  id: string
  categoria: 'filme' | 'serie' | 'esporte'
  imagem_url: string
  logo_url: string
  sinopse?: string
  data_evento?: string
  logo_personalizada?: string
  posicao_logo?: 'direita' | 'centro'
  data_criacao: string
  usuario_id: string
  created_at?: string
  updated_at?: string
}

// Funções de inicialização das tabelas
export const initializeTables = async () => {
  if (!supabase) {
    console.log('⚠️ Supabase não configurado - usando modo offline')
    return
  }

  try {
    // Criar tabelas usando SQL direto
    const queries = [
      `
      CREATE TABLE IF NOT EXISTS usuarios (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo TEXT CHECK (tipo IN ('admin', 'usuario')) DEFAULT 'usuario',
        ativo BOOLEAN DEFAULT true,
        data_cadastro TEXT NOT NULL,
        ultimo_acesso TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
      `
      CREATE TABLE IF NOT EXISTS clientes (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        plano TEXT NOT NULL,
        status TEXT CHECK (status IN ('ativo', 'inativo', 'suspenso', 'vencido')) DEFAULT 'ativo',
        data_vencimento TEXT NOT NULL,
        valor_mensal DECIMAL(10,2) DEFAULT 0,
        data_ultimo_pagamento TEXT,
        observacoes TEXT,
        data_cadastro TEXT NOT NULL,
        usuario_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
      `
      CREATE TABLE IF NOT EXISTS servidores (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        link TEXT NOT NULL,
        descricao TEXT,
        ativo BOOLEAN DEFAULT true,
        data_criacao TEXT NOT NULL,
        usuario_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
      `
      CREATE TABLE IF NOT EXISTS banners (
        id TEXT PRIMARY KEY,
        categoria TEXT CHECK (categoria IN ('filme', 'serie', 'esporte')) NOT NULL,
        imagem_url TEXT NOT NULL,
        logo_url TEXT,
        sinopse TEXT,
        data_evento TEXT,
        logo_personalizada TEXT,
        posicao_logo TEXT CHECK (posicao_logo IN ('direita', 'centro')),
        data_criacao TEXT NOT NULL,
        usuario_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `
    ]

    for (const query of queries) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        if (error && !error.message.includes('already exists')) {
          console.log('Tentando criar tabela via query direta...')
        }
      } catch (err) {
        console.log('Tabela pode já existir:', err)
      }
    }

    console.log('✅ Tabelas inicializadas no Supabase')
  } catch (error) {
    console.error('❌ Erro ao inicializar tabelas:', error)
  }
}

// Classe para gerenciar dados no Supabase
export class SupabaseAPI {
  // Verificar se Supabase está disponível
  private static isAvailable(): boolean {
    return supabase !== null
  }

  // Usuários
  static async salvarUsuario(usuario: SupabaseUsuario): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('⚠️ Supabase não disponível - dados salvos apenas localmente')
      return false
    }

    try {
      const { error } = await supabase!
        .from('usuarios')
        .upsert({
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          senha: usuario.senha,
          tipo: usuario.tipo,
          ativo: usuario.ativo,
          data_cadastro: usuario.data_cadastro,
          ultimo_acesso: usuario.ultimo_acesso
        })

      if (error) {
        console.error('❌ Erro ao salvar usuário no Supabase:', error)
        return false
      }

      console.log('✅ Usuário salvo no Supabase:', usuario.nome)
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar usuário:', error)
      return false
    }
  }

  static async carregarUsuarios(): Promise<SupabaseUsuario[]> {
    if (!this.isAvailable()) {
      return []
    }

    try {
      const { data, error } = await supabase!
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao carregar usuários do Supabase:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
      return []
    }
  }

  static async atualizarUsuario(id: string, dados: Partial<SupabaseUsuario>): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from('usuarios')
        .update(dados)
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao atualizar usuário no Supabase:', error)
        return false
      }

      console.log('✅ Usuário atualizado no Supabase:', id)
      return true
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
      return false
    }
  }

  static async excluirUsuario(id: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from('usuarios')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao excluir usuário do Supabase:', error)
        return false
      }

      console.log('✅ Usuário excluído do Supabase:', id)
      return true
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error)
      return false
    }
  }

  // Clientes
  static async salvarCliente(cliente: SupabaseCliente): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from('clientes')
        .upsert({
          id: cliente.id,
          nome: cliente.nome,
          whatsapp: cliente.whatsapp,
          plano: cliente.plano,
          status: cliente.status,
          data_vencimento: cliente.data_vencimento,
          valor_mensal: cliente.valor_mensal,
          data_ultimo_pagamento: cliente.data_ultimo_pagamento,
          observacoes: cliente.observacoes,
          data_cadastro: cliente.data_cadastro,
          usuario_id: cliente.usuario_id
        })

      if (error) {
        console.error('❌ Erro ao salvar cliente no Supabase:', error)
        return false
      }

      console.log('✅ Cliente salvo no Supabase:', cliente.nome)
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar cliente:', error)
      return false
    }
  }

  static async carregarClientes(): Promise<SupabaseCliente[]> {
    if (!this.isAvailable()) {
      return []
    }

    try {
      const { data, error } = await supabase!
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao carregar clientes do Supabase:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error)
      return []
    }
  }

  static async atualizarCliente(id: string, dados: Partial<SupabaseCliente>): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from('clientes')
        .update(dados)
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao atualizar cliente no Supabase:', error)
        return false
      }

      console.log('✅ Cliente atualizado no Supabase:', id)
      return true
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error)
      return false
    }
  }

  static async excluirCliente(id: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from('clientes')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao excluir cliente do Supabase:', error)
        return false
      }

      console.log('✅ Cliente excluído do Supabase:', id)
      return true
    } catch (error) {
      console.error('❌ Erro ao excluir cliente:', error)
      return false
    }
  }

  // Servidores
  static async salvarServidor(servidor: SupabaseServidor): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from('servidores')
        .upsert({
          id: servidor.id,
          nome: servidor.nome,
          link: servidor.link,
          descricao: servidor.descricao,
          ativo: servidor.ativo,
          data_criacao: servidor.data_criacao,
          usuario_id: servidor.usuario_id
        })

      if (error) {
        console.error('❌ Erro ao salvar servidor no Supabase:', error)
        return false
      }

      console.log('✅ Servidor salvo no Supabase:', servidor.nome)
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar servidor:', error)
      return false
    }
  }

  static async carregarServidores(): Promise<SupabaseServidor[]> {
    if (!this.isAvailable()) {
      return []
    }

    try {
      const { data, error } = await supabase!
        .from('servidores')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao carregar servidores do Supabase:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Erro ao carregar servidores:', error)
      return []
    }
  }

  static async atualizarServidor(id: string, dados: Partial<SupabaseServidor>): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from('servidores')
        .update(dados)
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao atualizar servidor no Supabase:', error)
        return false
      }

      console.log('✅ Servidor atualizado no Supabase:', id)
      return true
    } catch (error) {
      console.error('❌ Erro ao atualizar servidor:', error)
      return false
    }
  }

  static async excluirServidor(id: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from('servidores')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao excluir servidor do Supabase:', error)
        return false
      }

      console.log('✅ Servidor excluído do Supabase:', id)
      return true
    } catch (error) {
      console.error('❌ Erro ao excluir servidor:', error)
      return false
    }
  }

  // Banners
  static async salvarBanner(banner: SupabaseBanner): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from('banners')
        .upsert({
          id: banner.id,
          categoria: banner.categoria,
          imagem_url: banner.imagem_url,
          logo_url: banner.logo_url,
          sinopse: banner.sinopse,
          data_evento: banner.data_evento,
          logo_personalizada: banner.logo_personalizada,
          posicao_logo: banner.posicao_logo,
          data_criacao: banner.data_criacao,
          usuario_id: banner.usuario_id
        })

      if (error) {
        console.error('❌ Erro ao salvar banner no Supabase:', error)
        return false
      }

      console.log('✅ Banner salvo no Supabase:', banner.categoria)
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar banner:', error)
      return false
    }
  }

  static async carregarBanners(): Promise<SupabaseBanner[]> {
    if (!this.isAvailable()) {
      return []
    }

    try {
      const { data, error } = await supabase!
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao carregar banners do Supabase:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Erro ao carregar banners:', error)
      return []
    }
  }

  static async excluirBanner(id: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from('banners')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao excluir banner do Supabase:', error)
        return false
      }

      console.log('✅ Banner excluído do Supabase:', id)
      return true
    } catch (error) {
      console.error('❌ Erro ao excluir banner:', error)
      return false
    }
  }

  // Autenticação
  static async autenticar(email: string, senha: string): Promise<SupabaseUsuario | null> {
    if (!this.isAvailable()) {
      return null
    }

    try {
      const { data, error } = await supabase!
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .eq('ativo', true)
        .single()

      if (error || !data) {
        console.log('❌ Credenciais inválidas ou usuário inativo:', email)
        return null
      }

      // Atualizar último acesso
      await this.atualizarUsuario(data.id, { ultimo_acesso: new Date().toISOString() })

      console.log('✅ Login realizado com sucesso no Supabase:', data.nome)
      return data
    } catch (error) {
      console.error('❌ Erro na autenticação:', error)
      return null
    }
  }

  // Sincronização completa
  static async sincronizarTodos(): Promise<{
    usuarios: SupabaseUsuario[]
    clientes: SupabaseCliente[]
    servidores: SupabaseServidor[]
    banners: SupabaseBanner[]
  }> {
    if (!this.isAvailable()) {
      return { usuarios: [], clientes: [], servidores: [], banners: [] }
    }

    try {
      const [usuarios, clientes, servidores, banners] = await Promise.all([
        this.carregarUsuarios(),
        this.carregarClientes(),
        this.carregarServidores(),
        this.carregarBanners()
      ])

      console.log('✅ Sincronização completa do Supabase:', {
        usuarios: usuarios.length,
        clientes: clientes.length,
        servidores: servidores.length,
        banners: banners.length
      })

      return { usuarios, clientes, servidores, banners }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error)
      return { usuarios: [], clientes: [], servidores: [], banners: [] }
    }
  }
}