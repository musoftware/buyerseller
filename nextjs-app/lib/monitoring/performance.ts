/**
 * Performance Monitoring
 * Track Core Web Vitals and custom metrics
 */

interface PerformanceMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: number;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private observers: PerformanceObserver[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            this.initWebVitals();
        }
    }

    private initWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observeLCP();

        // First Input Delay (FID)
        this.observeFID();

        // Cumulative Layout Shift (CLS)
        this.observeCLS();

        // First Contentful Paint (FCP)
        this.observeFCP();

        // Time to First Byte (TTFB)
        this.observeTTFB();
    }

    private observeLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as any;

                this.recordMetric({
                    name: 'LCP',
                    value: lastEntry.renderTime || lastEntry.loadTime,
                    rating: this.rateLCP(lastEntry.renderTime || lastEntry.loadTime),
                    timestamp: Date.now(),
                });
            });

            observer.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.push(observer);
        } catch (e) {
            // LCP not supported
        }
    }

    private observeFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    this.recordMetric({
                        name: 'FID',
                        value: entry.processingStart - entry.startTime,
                        rating: this.rateFID(entry.processingStart - entry.startTime),
                        timestamp: Date.now(),
                    });
                });
            });

            observer.observe({ entryTypes: ['first-input'] });
            this.observers.push(observer);
        } catch (e) {
            // FID not supported
        }
    }

    private observeCLS() {
        try {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });

                this.recordMetric({
                    name: 'CLS',
                    value: clsValue,
                    rating: this.rateCLS(clsValue),
                    timestamp: Date.now(),
                });
            });

            observer.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(observer);
        } catch (e) {
            // CLS not supported
        }
    }

    private observeFCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    this.recordMetric({
                        name: 'FCP',
                        value: entry.startTime,
                        rating: this.rateFCP(entry.startTime),
                        timestamp: Date.now(),
                    });
                });
            });

            observer.observe({ entryTypes: ['paint'] });
            this.observers.push(observer);
        } catch (e) {
            // FCP not supported
        }
    }

    private observeTTFB() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    this.recordMetric({
                        name: 'TTFB',
                        value: entry.responseStart - entry.requestStart,
                        rating: this.rateTTFB(entry.responseStart - entry.requestStart),
                        timestamp: Date.now(),
                    });
                });
            });

            observer.observe({ entryTypes: ['navigation'] });
            this.observers.push(observer);
        } catch (e) {
            // TTFB not supported
        }
    }

    private rateLCP(value: number): 'good' | 'needs-improvement' | 'poor' {
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'needs-improvement';
        return 'poor';
    }

    private rateFID(value: number): 'good' | 'needs-improvement' | 'poor' {
        if (value <= 100) return 'good';
        if (value <= 300) return 'needs-improvement';
        return 'poor';
    }

    private rateCLS(value: number): 'good' | 'needs-improvement' | 'poor' {
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'needs-improvement';
        return 'poor';
    }

    private rateFCP(value: number): 'good' | 'needs-improvement' | 'poor' {
        if (value <= 1800) return 'good';
        if (value <= 3000) return 'needs-improvement';
        return 'poor';
    }

    private rateTTFB(value: number): 'good' | 'needs-improvement' | 'poor' {
        if (value <= 800) return 'good';
        if (value <= 1800) return 'needs-improvement';
        return 'poor';
    }

    private recordMetric(metric: PerformanceMetric) {
        this.metrics.push(metric);

        // Send to analytics
        this.sendToAnalytics(metric);

        // Log in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
        }
    }

    private sendToAnalytics(metric: PerformanceMetric) {
        // Send to Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', metric.name, {
                value: Math.round(metric.value),
                metric_rating: metric.rating,
                metric_value: metric.value,
            });
        }

        // Send to custom analytics endpoint
        if (process.env.NODE_ENV === 'production') {
            fetch('/api/analytics/performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metric),
            }).catch(() => {
                // Silently fail
            });
        }
    }

    /**
     * Measure custom timing
     */
    measure(name: string, startMark: string, endMark: string) {
        try {
            performance.measure(name, startMark, endMark);
            const measure = performance.getEntriesByName(name)[0];

            this.recordMetric({
                name: `custom_${name}`,
                value: measure.duration,
                rating: measure.duration < 1000 ? 'good' : measure.duration < 3000 ? 'needs-improvement' : 'poor',
                timestamp: Date.now(),
            });
        } catch (e) {
            console.error('Performance measurement error:', e);
        }
    }

    /**
     * Mark a performance point
     */
    mark(name: string) {
        try {
            performance.mark(name);
        } catch (e) {
            console.error('Performance mark error:', e);
        }
    }

    /**
     * Get all metrics
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics = [];
    }

    /**
     * Cleanup observers
     */
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// Export singleton
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
export { PerformanceMonitor };
