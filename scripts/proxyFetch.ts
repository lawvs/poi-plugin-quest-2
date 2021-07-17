/* eslint-disable no-console */
import nodeFetch from 'node-fetch'
import type { Request, RequestInfo } from 'node-fetch'
import type { Agent } from 'http'
import { HttpsProxyAgent } from 'https-proxy-agent'

const withAgent =
  (agent: Agent) =>
  (fetch: typeof nodeFetch): typeof nodeFetch => {
    const isRequest = (input: RequestInfo): input is Request => {
      return typeof input === 'object' && !('href' in input)
    }
    return new Proxy(fetch, {
      apply(target, thisArg: unknown, argArray: Parameters<typeof nodeFetch>) {
        if (isRequest(argArray[0])) {
          // Request
          if (!argArray[0].agent) {
            argArray[0].agent = agent
          }
        } else {
          // URL or URLLike + ?RequestInit
          if (!argArray[1]) {
            argArray[1] = {}
          }
          if (!argArray[1].agent) {
            argArray[1].agent = agent
          }
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
