// Copyright (c) 2022-2023 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

// An example Worker that serves static files from disk. This includes logic to do things like
// set Content-Type based on file extension, look for `index.html` in directories, etc.
//
// This code supports several configuration options to control the serving logic, but, better
// yet, because it's just JavaScript, you can freely edit it to suit your unique needs.
const responseInit = {
  headers: {
    "Cache-Control": "no-cache",
    "Content-Type": "application/octet-stream",
    "Cross-Origin-Opener-Policy": "unsafe-none",
    "Cross-Origin-Embedder-Policy": "unsafe-none",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Private-Network": "true",
    "Access-Control-Allow-Headers": "Access-Control-Request-Private-Network",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,HEAD,QUERY,PUT",
  },
};

export default {
  async fetch(request, env) {;
    let url = new URL(request.url);
    let path = url.pathname;
    let file = await env.files.fetch("http://null" + path, {
      method: request.method,
      body: request.body,
    });
    return new Response(
      request.method === "PUT"
        ? `File written to ${env.config.dir}${path}`
        : file.body,
      responseInit,
    );
  },
};
