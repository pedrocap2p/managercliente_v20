import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o Supabase (snake_case)
export interface SupabaseUsuario {
  id: string
  nome: string
  email: string
  senha: string
  tipo: 'admin' | 'usuario'
  ativo: boolean
  data_cadastro: string
  ultimo_acesso: string
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
}

export interface SupabaseServidor {
  id: string
  nome: string
  link: string
  descricao: string
  ativo: boolean
  data_criacao: string
  usuario_id: string
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
}

// API do Supabase
export class SupabaseAPI {
  // Inicializar tabelas
  static async initializeTables(): Promise<void> {
    try {
      // Criar tabela de usuários
      await supabase.rpc('create_usuarios_table', {})
      
      // Criar tabela de clientes
      await supabase.rpc('create_clientes_table', {})
      
      // Criar tabela de servidores
      await supabase.rpc('create_servidores_table', {})
      
      // Criar tabela de banners
      await supabase.rpc('create_banners_table', {})
      
      console.log('✅ Tabelas do Supabase inicializadas')
    } catch (error) {
      console.log('ℹ️ Tabelas já existem ou erro na criação:', error)
    }
  }

  // Usuários
  static async salvarUsuario(usuario: SupabaseUsuario): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('usuarios')
        .upsert(usuario)
      
      if (error) {
        console.error('❌ Erro ao salvar usuário no Supabase:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('❌ Erro na conexão com Supabase:', error)
      return false
    }
  }

  static async autenticar(email: string, senha: string): Promise<SupabaseUsuario | null> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .eq('ativo', true)
        .single()
      
      if (error || !data) {
        return null
      }
      
      // Atualizar último acesso
      await supabase
        .from('usuarios')
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq('id', data.id)
      
      return data
    } catch (error) {
      console.error('❌ Erro na autenticação:', error)
      return null
    }
  }

  static async atualizarUsuario(id: string, dados: Partial<SupabaseUsuario>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update(dados)
        .eq('id', id)
      
      return !error
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
      return false
    }
  }

  static async excluirUsuario(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id)
      
      return !error
    } catch (error) {
      console.error('❌ Erro ao excluir usuário:', error)
      return false
    }
  }

  // Clientes
  static async salvarCliente(cliente: SupabaseCliente): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clientes')
        .upsert(cliente)
      
      return !error
    } catch (error) {
      console.error('❌ Erro ao salvar cliente:', error)
      return false
    }
  }

  static async atualizarCliente(id: string, dados: Partial<SupabaseCliente>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clientes')
        .update(dados)
        .eq('id', id)
      
      return !error
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error)
      return false
    }
  }

  static async excluirCliente(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
      
      return !error
    } catch (error) {
      console.error('❌ Erro ao excluir cliente:', error)
      return false
    }
  }

  // Servidores
  static async salvarServidor(servidor: SupabaseServidor): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('servidores')
        .upsert(servidor)
      
      return !error
    } catch (error) {
      console.error('❌ Erro ao salvar servidor:', error)
      return false
    }
  }

  static async atualizarServidor(id: string, dados: Partial<SupabaseServidor>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('servidores')
        .update(dados)
        .eq('id', id)
      
      return !error
    } catch (error) {
      console.error('❌ Erro ao atualizar servidor:', error)
      return false
    }
  }

  static async excluirServidor(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('servidores')
        .delete()
        .eq('id', id)
      
      return !error
    } catch (error) {
      console.error('❌ Erro ao excluir servidor:', error)
      return false
    }
  }

  // Banners
  static async salvarBanner(banner: SupabaseBanner): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('banners')
        .upsert(banner)
      
      return !error
    } catch (error) {
      console.error('❌ Erro ao salvar banner:', error)
      return false
    }
  }

  static async excluirBanner(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)
      
      return !error
    } catch (error) {
      console.error('❌ Erro ao excluir banner:', error)
      return false
    }
  }

  // Sincronização completa
  static async sincronizarTodos(): Promise<{
    usuarios: SupabaseUsuario[]
    clientes: SupabaseCliente[]
    servidores: SupabaseServidor[]
    banners: SupabaseBanner[]
  }> {
    try {
      const [usuariosResult, clientesResult, servidoresResult, bannersResult] = await Promise.all([
        supabase.from('usuarios').select('*'),
        supabase.from('clientes').select('*'),
        supabase.from('servidores').select('*'),
        supabase.from('banners').select('*')
      ])

      return {
        usuarios: usuariosResult.data || [],
        clientes: clientesResult.data || [],
        servidores: servidoresResult.data || [],
        banners: bannersResult.data || []
      }
    } catch (error) {
      console.error('❌ Erro na sincronização:', error)
      return {
        usuarios: [],
        clientes: [],
        servidores: [],
        banners: []
      }
    }
  }
}

// Função para inicializar tabelas (exportada)
export async function initializeTables(): Promise<void> {
  try {
    // Criar tabelas se não existirem
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
          ultimo_acesso TEXT NOT NULL
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
          valor_mensal REAL DEFAULT 0,
          data_ultimo_pagamento TEXT,
          observacoes TEXT,
          data_cadastro TEXT NOT NULL,
          usuario_id TEXT NOT NULL
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
          usuario_id TEXT NOT NULL
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
          usuario_id TEXT NOT NULL
        );
      `
    ]

    for (const query of queries) {
      await supabase.rpc('exec_sql', { sql: query })
    }

    console.log('✅ Tabelas inicializadas com sucesso')
  } catch (error) {
    console.log('ℹ️ Tabelas já existem ou usando fallback local:', error)
  }
}