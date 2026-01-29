/**
 * Upstash Redis Session Store for express-session
 * Compatible with Upstash Redis REST API
 */

module.exports = function(session) {
    const Store = session.Store;
    
    class UpstashStore extends Store {
        constructor(options = {}) {
            super(options);
            this.client = options.client;
            this.prefix = options.prefix || 'sess:';
            this.ttl = options.ttl || 86400; // 24 hours default
            
            if (!this.client) {
                throw new Error('Upstash Redis client is required');
            }
        }
        
        /**
         * Get session from Upstash Redis
         */
        async get(sid, callback) {
            try {
                const key = this.prefix + sid;
                const data = await this.client.get(key);
                
                if (!data) {
                    return callback();
                }
                
                const session = typeof data === 'string' ? JSON.parse(data) : data;
                callback(null, session);
            } catch (err) {
                callback(err);
            }
        }
        
        /**
         * Set session in Upstash Redis
         */
        async set(sid, session, callback) {
            try {
                const key = this.prefix + sid;
                const value = JSON.stringify(session);
                
                // Calculate TTL from session.cookie.maxAge or use default
                const maxAge = session.cookie?.maxAge;
                const ttl = maxAge ? Math.floor(maxAge / 1000) : this.ttl;
                
                await this.client.setex(key, ttl, value);
                callback && callback();
            } catch (err) {
                callback && callback(err);
            }
        }
        
        /**
         * Destroy session in Upstash Redis
         */
        async destroy(sid, callback) {
            try {
                const key = this.prefix + sid;
                await this.client.del(key);
                callback && callback();
            } catch (err) {
                callback && callback(err);
            }
        }
        
        /**
         * Touch session (update TTL)
         */
        async touch(sid, session, callback) {
            try {
                const key = this.prefix + sid;
                const maxAge = session.cookie?.maxAge;
                const ttl = maxAge ? Math.floor(maxAge / 1000) : this.ttl;
                
                await this.client.expire(key, ttl);
                callback && callback();
            } catch (err) {
                callback && callback(err);
            }
        }
    }
    
    return UpstashStore;
};
