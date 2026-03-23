import { redirect } from 'next/navigation';

type CallbackRPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CallbackRPage({ searchParams }: CallbackRPageProps) {
  const params = (await searchParams) || {};
  const nextParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      nextParams.set(key, value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        nextParams.append(key, item);
      }
    }
  }

  const query = nextParams.toString();
  redirect(query ? `/callback?${query}` : '/callback');
}
