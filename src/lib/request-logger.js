import Logger from '@/lib/logger';

const logger = new Logger('RequestLogger');

export function createRequestLogger() {
  const activeRequests = new Map();
  
  return {
    logStart(request, context) {
      const id = `${Date.now()}-${Math.random()}`;
      const startTime = Date.now();
      const url = request.url;
      const method = request.method;
      
      activeRequests.set(id, {
        url,
        method,
        startTime,
        userId: context?.id || 'anonymous'
      });
      
      logger.info(`[${id}] ${method} ${url} - START`, {
        activeCount: activeRequests.size
      });
      
      return id;
    },
    
    logEnd(id, statusCode) {
      const req = activeRequests.get(id);
      if (!req) return;
      
      const duration = Date.now() - req.startTime;
      activeRequests.delete(id);
      
      const logLevel = duration > 5000 ? 'error' : duration > 1000 ? 'warn' : 'info';
      logger[logLevel](`[${id}] ${req.method} ${req.url} - END`, {
        duration: `${duration}ms`,
        status: statusCode,
        activeCount: activeRequests.size
      });
    },
    
    getActiveRequests() {
      return Array.from(activeRequests.entries()).map(([id, req]) => ({
        id,
        ...req,
        duration: Date.now() - req.startTime
      }));
    }
  };
}

const requestLogger = createRequestLogger();
export default requestLogger;