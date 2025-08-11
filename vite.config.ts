import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api/emma': {
				target: 'https://emma.mav.hu',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/emma/, '/otp2-backend/otp/routers/default/index/graphql'),
				configure: (proxy) => {
					proxy.on('error', (err) => {
						console.log('Proxy error:', err);
					});
					proxy.on('proxyReq', (proxyReq, req) => {
						console.log('Sending Request to the Target:', req.method, req.url);
					});
					proxy.on('proxyRes', (proxyRes, req) => {
						console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
					});
				},
			}
		}
	}
});
