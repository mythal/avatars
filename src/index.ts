import React from 'react';
import { renderToString } from 'react-dom/server';
import Avatar, { AvatarProps } from 'boring-avatars';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

const DEFAULT_COLORS = [
	"#92A1C6",
	"#146A7C",
	"#F0AB3D",
	"#C271B4",
	"#C20D90",
];

const variantList: Array<AvatarProps['variant']> = ['marble', 'beam', 'pixel', 'sunset', 'ring', 'bauhaus'];

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		let cache = caches.default;
		const cachedRes = await cache.match(request);
		if (cachedRes) {
			return cachedRes;
		}
		const url = new URL(request.url);
		if (url.pathname === '/favicon.ico') {
			return new Response(null, { status: 204 });
		}
		let name = '';
		if (url.pathname.length > 1) {
			name = url.pathname.substring(1, 128);
		} else {
			return new Response('Please provide a name', { status: 400 });
		}

		const digest = await crypto.subtle.digest(
			{
				name: 'SHA-256',
			},
			new TextEncoder().encode(name)
		);
		const number = new DataView(digest).getUint32(0);
		const variant = variantList[number % variantList.length];
		const avatar = renderToString(
			React.createElement(Avatar, {
				size: 200,
				square: true,
				name,
				variant,
				colors: DEFAULT_COLORS,
			}, null),
		);
		const res = new Response(avatar);
		res.headers.set('Cache-Control', 'public, max-age=86400');
		res.headers.set('Content-Type', "image/svg+xml");
		await cache.put(request, res.clone());
		return res;
	},
};
