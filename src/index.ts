export interface Env {
  EMAIL: SendEmail;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json() as { name?: string; email?: string; message?: string };
        
        if (!body.email || !body.message) {
          return new Response(JSON.stringify({ error: 'Email and message are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Send email via Cloudflare Email Sending binding
        await env.EMAIL.send({
          to: [{ email: 'support@techsmartfix-it.com', name: 'TechSmartFix-It Support' }],
          from: { email: 'noreply@techsmartfix-it.com', name: 'TechSmartFix-It System' },
          subject: `New Support Request from ${body.name || 'User'}`,
          content: [
            { type: 'text/plain', value: `Name: ${body.name}\nEmail: ${body.email}\nMessage:\n${body.message}` }
          ]
        });

        return new Response(JSON.stringify({ success: true, message: 'Support request sent successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      service: 'TechSmartFix-It API',
      version: '1.0.0',
      environment: env.ENVIRONMENT,
      endpoints: {
        contact: 'POST /api/contact'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
