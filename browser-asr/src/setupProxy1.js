const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api/socket",
    createProxyMiddleware({
      target: "http://localhost:4000",
      changeOrigin: true,
      
      pathRewrite: (path, req) => {
        return path.replace("/api/socket", "");
      },
      ws: true,
      // onProxyRes: (proxyRes, req, res) => {
      //   // log original request and proxied request info
      //   const exchange = `[${req.method}] [${proxyRes.statusCode}] ${req.path} -> ${proxyRes.req.protocol}//${proxyRes.req.host}${proxyRes.req.path}`;
      //   console.log(exchange); // [GET] [200] / -> http://www.example.com
      // },
      onProxyReq: function(proxyReq, req, socket) {
        console.log('socket on proxy req', proxyReq.getHeaders());
      },
      // logLevel: 'debug',
    })
  );
  app.use(
    "/api/hls",
    createProxyMiddleware({
      target: "http://localhost:7000",
      changeOrigin: true,
      ws: true,
      pathRewrite: (path, req) => {
        return path.replace("/api/hls", "");
      },
    })
  );
  app.use(
    "/api/dataflow",
    createProxyMiddleware({
      target: "ws://localhost:5000",
      changeOrigin: true,
      ws: true,
      pathRewrite: (path, req) => {
        return path.replace("/api/dataflow", "");
      },
    })
  );
  app.use(morgan('combined'));
};