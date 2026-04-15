import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function normalizarPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export async function postAuth<TResponse = unknown>(
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<TResponse>> {
  const pathNormalizado = normalizarPath(path);
  const candidatos = [`/auth${pathNormalizado}`, pathNormalizado];

  let ultimoErro: unknown;

  for (const url of candidatos) {
    try {
      return await api.post<TResponse>(url, data, config);
    } catch (erro) {
      if (axios.isAxiosError(erro) && erro.response?.status !== 404) {
        throw erro;
      }

      ultimoErro = erro;
    }
  }

  throw ultimoErro ?? new Error("Nao foi possivel conectar ao endpoint de auth.");
}