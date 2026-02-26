export type FetchInterceptor = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
) => { input: RequestInfo | URL; init: RequestInit | undefined } | null;

export type FetchResponseInterceptor = (
  response: Response,
  input: RequestInfo | URL,
  init: RequestInit | undefined,
) => Response | Promise<Response>;

const requestInterceptors = new Set<FetchInterceptor>();
const responseInterceptors = new Set<FetchResponseInterceptor>();
let installed = false;

function installFetchInterception(): void {
  if (installed) return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    let currentInput = input;
    let currentInit = init;

    for (const interceptor of requestInterceptors) {
      try {
        const result = interceptor(currentInput, currentInit);
        if (result === null) {
          return new Response(null, { status: 0 });
        }
        currentInput = result.input;
        currentInit = result.init;
      } catch {
        // request interceptor errors should not block fetch
      }
    }

    let response = await originalFetch(currentInput, currentInit);

    for (const interceptor of responseInterceptors) {
      try {
        response = await interceptor(response, currentInput, currentInit);
      } catch {
        // response interceptor errors should not corrupt the response
      }
    }

    return response;
  };
}

export function addFetchRequestInterceptor(
  interceptor: FetchInterceptor,
): () => void {
  installFetchInterception();
  requestInterceptors.add(interceptor);
  return () => requestInterceptors.delete(interceptor);
}

export function addFetchResponseInterceptor(
  interceptor: FetchResponseInterceptor,
): () => void {
  installFetchInterception();
  responseInterceptors.add(interceptor);
  return () => responseInterceptors.delete(interceptor);
}
