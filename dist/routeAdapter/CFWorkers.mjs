export default class RouteAdapterCFWorkers {
    static async handler(result, resolve) {
        const headers = new Headers();
        result.cookies.forEach((cookie) => {
            let attributes = '';
            if (cookie.options.domain) {
                attributes += `Domain=${cookie.options.domain}; `;
            }
            if (cookie.options.expires) {
                attributes += `Expires=${cookie.options.expires}; `;
            }
            if (cookie.options.httpOnly) {
                attributes += `HttpOnly; `;
            }
            if (cookie.options.maxAge) {
                attributes += `Max-Age=${cookie.options.maxAge}; `;
            }
            if (cookie.options.path) {
                attributes += `Path=${cookie.options.path}; `;
            }
            if (cookie.options.secure) {
                attributes += `Secure; `;
            }
            if (cookie.options.sameSite) {
                attributes += `SameSite=${cookie.options.sameSite}; `;
            }
            //remove trailing semicolon
            attributes = attributes.replace(/; $/, '');
            headers.append('Set-Cookie', `${cookie.name}=${cookie.value}; ${attributes}`);
        });
        Object.keys(result.headers).forEach(headerName => {
            headers.set(headerName, result.headers[headerName]);
        });
        resolve(new Response(result.body, {
            status: result.status,
            headers,
        }));
    }
    static addRoute(app, route, callback) {
        app.route({
            method: route.method,
            url: route.path,
            handler: callback,
        });
    }
}
