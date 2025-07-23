# Fault Tolerance Middleware

This directory contains enhanced middleware for handling fault tolerance, rate limiting, and resilience patterns in the application.

## Overview

The fault tolerance system provides comprehensive protection against:
- Rate limiting and DDoS attacks
- Circuit breaker patterns for external service failures
- Request timeouts and connection issues
- Graceful error handling and recovery
- Health monitoring and status checks

## Components

### 1. faultTolerance.js

Main fault tolerance middleware providing:

#### Rate Limiters
- **General**: 1000 requests per 15 minutes for overall API protection
- **Authentication**: 10 attempts per 15 minutes for login/auth endpoints
- **API**: 100 requests per minute for general API endpoints
- **Static**: 500 requests per minute for static content

#### Circuit Breaker
- Monitors service health and prevents cascading failures
- Configurable failure threshold (default: 5 failures)
- Automatic recovery with half-open state testing
- Reset timeout of 60 seconds

#### Speed Limiter
- Slows down requests instead of blocking them
- Adds progressive delays after 50 requests per minute
- Maximum delay of 2 seconds

#### Additional Features
- Request timeout handling (30 seconds default)
- Health check endpoints
- Graceful shutdown handling
- Redis support for distributed rate limiting

### 2. Interceptor.js (Enhanced)

Updated interceptor with:
- Enhanced CORS configuration
- Integration with fault tolerance middleware
- Multiple origin support for development
- Improved security headers

## Usage

### Installation

Install required dependencies:
```bash
npm install express-slow-down rate-limit-redis redis response-time
```

### Configuration

The middleware is automatically configured in `server.js` with the following order:

1. Security middleware (helmet, CORS, compression)
2. Logging and monitoring (morgan, response-time)
3. Request timeout and health checks
4. Rate limiting (general → speed limiting → specific routes)
5. Body parsing
6. Application routes
7. Error handling

### Environment Variables

Optional Redis configuration:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

### Rate Limiting by Route

```javascript
// Authentication routes (strict)
app.use('/api/auth', rateLimiters.auth);

// General API routes (moderate)
app.use('/api', rateLimiters.api);

// Static content (lenient)
app.use('/static', rateLimiters.static);
```

### Circuit Breaker Usage

```javascript
const { CircuitBreaker } = require('./middlewares/faultTolerance');

const breaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000
});

// Wrap external service calls
const result = await breaker.execute(async () => {
    return await externalServiceCall();
});
```

## Error Handling

The system provides specific error responses for different scenarios:

- **429 Too Many Requests**: Rate limit exceeded
- **408 Request Timeout**: Request took too long
- **503 Service Unavailable**: Circuit breaker open or connection issues
- **500 Internal Server Error**: Unexpected errors with optional stack trace in development

## Health Monitoring

Health check endpoint available at:
- `GET /health`
- `GET /api/health`

Returns:
```json
{
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600
}
```

## Benefits

1. **Improved Reliability**: Circuit breakers prevent cascading failures
2. **Better Performance**: Speed limiting instead of hard blocking
3. **Enhanced Security**: Multi-tier rate limiting protects against abuse
4. **Monitoring**: Built-in health checks and error tracking
5. **Scalability**: Redis support for distributed deployments
6. **User Experience**: Graceful degradation instead of hard failures

## Troubleshooting

### Common Issues

1. **Redis Connection Errors**: The system falls back to memory-based rate limiting if Redis is unavailable
2. **Rate Limit False Positives**: Adjust rate limits in `faultTolerance.js` based on your traffic patterns
3. **Circuit Breaker Triggering**: Check external service health and adjust thresholds if needed

### Monitoring

Monitor these metrics:
- Rate limit hit rates
- Circuit breaker state changes
- Request timeout frequency
- Error recovery patterns

### Performance Tuning

Adjust these parameters based on your needs:
- Rate limit windows and thresholds
- Circuit breaker failure thresholds
- Request timeout values
- Speed limiter delays