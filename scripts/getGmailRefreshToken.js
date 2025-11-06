const { google } = require('googleapis');
const http = require('http');
const url = require('url');

async function main() {
    const { default: open } = await import('open');

    const oauth2Client = new google.auth.OAuth2(
      '1095269337813-s32p8if4516t1206u1h7g4el23qm19ns.apps.googleusercontent.com',
      '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',
      'http://localhost:3000/api/cred'
    );

    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force to get refresh token
    });

    console.log('\n==============================================');
    console.log('Gmail OAuth2 Refresh Token Generator');
    console.log('==============================================\n');
    console.log('Authorize this app by visiting this url:\n');
    console.log(authUrl);
    console.log('\n');

    const server = http.createServer(async (req, res) => {
      try {
        if (req.url.indexOf('/api/cred') > -1) {
          const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
          const code = qs.get('code');
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Authentication successful!</h1><p>Please return to the console.</p>');
          
          server.close();

          const { tokens } = await oauth2Client.getToken(code);
          
          console.log('\n==============================================');
          console.log('SUCCESS! Your refresh token:');
          console.log('==============================================\n');
          console.log(tokens.refresh_token);
          console.log('\n');
          console.log('Add this to your .env.local EMAIL_CREDENTIALS:');
          console.log('==============================================\n');
          
          const credentials = {
            web: {
              client_id: '1095269337813-s32p8if4516t1206u1h7g4el23qm19ns.apps.googleusercontent.com',
              project_id: 'stage-email-integration',
              auth_uri: 'https://accounts.google.com/o/oauth2/auth',
              token_uri: 'https://oauth2.googleapis.com/token',
              auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
              client_secret: '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'
            },
            refresh_token: tokens.refresh_token
          };
          
          console.log("EMAIL_CREDENTIALS='" + JSON.stringify(credentials) + "'");
          console.log('\n');
          
          process.exit(0);
        }
      } catch (e) {
        console.error('Error during authentication:', e);
        res.end('Error during authentication');
        process.exit(1);
      }
    }).listen(3000, () => {
      console.log('Listening on http://localhost:3000');
      console.log('Opening browser...\n');
      
      // Automatically open the browser
      open(authUrl).catch(() => {
        console.log('Could not automatically open browser. Please manually visit the URL above.');
      });
    });
}

main().catch(console.error);
