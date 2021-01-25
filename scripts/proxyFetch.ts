import nodeFetch from 'node-fetch'
import type { Agent } from 'http'
import { HttpsProxyAgent } from 'https-proxy-agent'

const withAgent = (agent: Agent) => (
  fetch: typeof nodeFetch
): typeof nodeFetch => {
  return new Proxy(fetch, {
    apply(target, thisArg, argArray) {
      if (typeof argArray[0] === 'object' && argArray[0].href !== 'string') {
        // Request
        argArray[0].agent = agent
      } else {
        // URL or URLLike + ?Request
        if (argArray[1] === undefined) {
          argArray[1] = {}
        }
        argArray[1].agent = agent
      }
      return target.apply(thisArg, argArray)
    },
  })
}

let fetch = nodeFetch
// HTTP/HTTPS proxy to connect to
const proxy = process.env.https_proxy || process.env.http_proxy
if (proxy) {
  console.log('using proxy server %j', proxy)
  fetch = withAgent(new HttpsProxyAgent(proxy))(nodeFetch)
}

export { fetch }
