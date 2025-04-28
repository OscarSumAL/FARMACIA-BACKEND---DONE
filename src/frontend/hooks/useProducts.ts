import useSWR from 'swr';
import { Producto } from '@prisma/client';

interface ProductsResponse {
  data: Producto[];
  success: boolean;
  message?: string;
}

const fetcher = async (url: string): Promise<ProductsResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error al cargar los productos');
  }
  return response.json();
};

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>('/api/productos', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 10000,
    shouldRetryOnError: false
  });

  return {
    productos: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
} 