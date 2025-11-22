import client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'powerlytics_' });

const httpRequestDurationSeconds = new client.Histogram({
  name: 'powerlytics_http_request_duration_seconds',
  help: 'Request duration histogram',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

export function metricsMiddleware(req, res, next) {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    const route = req.route?.path || req.path;
    end({ method: req.method, route, status: res.statusCode });
  });
  next();
}

export function metricsController(_req, res) {
  res.set('Content-Type', client.register.contentType);
  client.register.metrics().then((metrics) => res.end(metrics));
}
