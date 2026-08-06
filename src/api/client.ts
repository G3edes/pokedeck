import axios from 'axios'

const API_BASE_URL = 'https://api.pokemontcg.io/v2'
const API_KEY = import.meta.env.VITE_POKEMON_TCG_API_KEY as string | undefined

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  if (API_KEY) {
    config.headers['X-Api-Key'] = API_KEY
  }
  return config
})

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 429) {
        return Promise.reject(
          new ApiError(
            'Limite de requisições atingido. Aguarde alguns instantes e tente novamente.',
            status,
          ),
        )
      }
      if (status && status >= 500) {
        return Promise.reject(
          new ApiError('O serviço da Pokémon TCG API está indisponível no momento.', status),
        )
      }
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new ApiError('A requisição demorou demais para responder.'))
      }
      if (!error.response) {
        return Promise.reject(
          new ApiError('Não foi possível conectar à Pokémon TCG API. Verifique sua conexão.'),
        )
      }
      return Promise.reject(
        new ApiError(error.response.data?.error?.message ?? 'Ocorreu um erro inesperado.', status),
      )
    }
    return Promise.reject(new ApiError('Ocorreu um erro inesperado.'))
  },
)
