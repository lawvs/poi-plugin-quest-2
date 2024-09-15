import { fetch, ProxyAgent, setGlobalDispatcher } from 'undici'

// HTTP/HTTPS proxy to connect to
const proxy = process.env.https_proxy || process.env.http_proxy

if (proxy) {
  // eslint-disable-next-line no-console
  console.log('using proxy server %j', proxy)
  setGlobalDispatcher(new ProxyAgent(proxy))
}

export { fetch }
