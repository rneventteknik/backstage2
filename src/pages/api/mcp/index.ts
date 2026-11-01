import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import { ReadableStream as NodeReadableStream } from 'stream/web';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { withMcpApiKeyContext } from '../../../lib/sessionContext';
import { createMcpServer } from '../../../lib/mcp/server';

// Each request gets a fresh server instance, so the endpoint is stateless. Clients on the 2025-era protocol (such as
// mcp-remote, which Claude Desktop needs to reach remote servers) are served statelessly alongside 2026-07-28 clients.
const mcpHandler = createMcpHandler(createMcpServer, { responseMode: 'json', legacy: 'stateless' });

const toWebRequest = (req: NextApiRequest): Request => {
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((x) => headers.append(key, x));
        } else if (value !== undefined) {
            headers.set(key, value);
        }
    });

    const hasBody = req.method === 'POST' && req.body !== undefined && req.body !== '';

    return new Request(new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`), {
        method: req.method,
        headers,
        body: hasBody ? JSON.stringify(req.body) : undefined,
    });
};

const handler = withMcpApiKeyContext(async (req: NextApiRequest, res: NextApiResponse, authInfo): Promise<void> => {
    const response = await mcpHandler.fetch(toWebRequest(req), {
        parsedBody: req.body === '' ? undefined : req.body,
        authInfo,
    });

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (!response.body) {
        res.end();
        return;
    }

    // Piped rather than buffered, since some responses (e.g. subscriptions/listen) are long-lived SSE streams.
    Readable.fromWeb(response.body as NodeReadableStream).pipe(res);
});

export default handler;
