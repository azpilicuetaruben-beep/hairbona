import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useServices() {
  const { data, error, isLoading, mutate } = useSWR('/api/services', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });
  return { services: data || [], error, isLoading, mutate };
}

export function useBarbers() {
  const { data, error, isLoading, mutate } = useSWR('/api/barbers', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });
  return { barbers: data || [], error, isLoading, mutate };
}

export function useGallery() {
  const { data, error, isLoading, mutate } = useSWR('/api/gallery', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });
  return { gallery: data || [], error, isLoading, mutate };
}

export function useConfig() {
  const { data, error, isLoading, mutate } = useSWR('/api/config', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });
  return { config: data || {}, error, isLoading, mutate };
}

export function useReviews() {
  const { data, error, isLoading, mutate } = useSWR('/api/reviews', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });
  return { reviews: data || [], error, isLoading, mutate };
}
