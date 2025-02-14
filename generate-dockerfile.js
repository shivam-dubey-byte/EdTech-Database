const fs = require('fs');
const path = require('path');

// Read package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get Node.js version from package.json (if specified)
const nodeVersion = packageJson.engines?.node || '16';

// Get the start script from package.json
const startScript = packageJson.scripts?.start || 'node app.js';

// Define default values
const appPort = 3000;
const workdir = '/app';

// Generate Dockerfile content
const dockerfileContent = `
# Auto-generated Dockerfile
FROM node:${nodeVersion}

WORKDIR ${workdir}

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${appPort}

CMD ${JSON.stringify(startScript.split(' '))}
`;

// Write Dockerfile
fs.writeFileSync(path.join(__dirname, 'Dockerfile'), dockerfileContent.trim());

console.log('Dockerfile generated successfully!');
