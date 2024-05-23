require('colors');
const prompts = require('prompts');
const pkg = require('./package.json');
const { isFQDN, isEmail, isIP } = require('validator');
const isEmpty = require('./utils/isEmpty');
const { v4: uuid } = require('uuid');
const exec = require('child_process').execSync;

const backendOutput = {
    PORT: 4002,
    PUBLIC_IP_ADDRESS: '192.168.1.1',
    MAPPED_IP: false,
    AUTH_SECRET: "secret key",
    BASE_URL: 'http://localhost',
    ROOT_USER_USERNAME: 'root',
    ROOT_USER_EMAIL: 'admin@example.com',
    ROOT_USER_PASSWORD: 'root',
    ROOT_USER_FIRST_NAME: 'Admin',
    ROOT_USER_LAST_NAME: 'User',
    MONGO_URI: 'mongodb://localhost:27017',
    MONGO_DATABASE: 'clover',
    MAILER_ENABLED: false,
};

let frontendOutput = {
    VITE_SITE_TITLE: 'Clover',
    VITE_BACKEND_URL: 'http://localhost',
    VITE_DEMO: false,
    VITE_SITE_BRAND: 'Honeyside',
    VITE_SHOW_CREDITS: true,
};

(async () => {
    const arg = process.argv[2];

    console.log(`received command: ${arg}`.cyan);

    console.log("");
    console.log("Honeyside".yellow);
    console.log(`Clover v${pkg.version} Installer`.yellow);
    console.log("");

    if (!['setup', 'rebuild', 'start', 'stop', 'restart'].includes(arg)) {
        console.log("");
        console.log(`invalid command: ${arg}`.red);
        console.log("");
        return;
    }

    let response, domain, nginx, baseUrl, email, username, password, firstName, lastName, secret;

    if (arg === 'setup') {

        console.log('Clover needs to know the public ip address of your machine.'.cyan);
        console.log('This is required for the meeting system to work, as traffic will be routed via UDP or TCP through such ip address.');
        console.log('If you don\'t know your ip address, run "ping elderberry.example.com" (replace with your domain) from a local terminal.');

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Your public ip address',
            validate: (e) => isIP(e) || `Must be a valid ip address`,
        });

        backendOutput['PUBLIC_IP_ADDRESS'] = response.value;

        console.log('');
        console.log('Are you using a mapped to public ip address, instead of a public one?'.cyan);
        console.log('Should be YES for AWS, Azure, Google Cloud and other public cloud instances.');
        console.log('Should be NO for OVH, DigitalOcean, Hetzner and other VPS providers.');

        response = await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Are you using a mapped ip address?',
        });

        backendOutput['MAPPED_IP'] = response.value;

        console.log('');
        console.log('Clover requires a domain, such as elderberry.example.com.'.cyan);
        console.log('Make sure your DNS configuration gets properly propagated before moving forward.');
        console.log('You can use https://dnschecker.org/');

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Your domain name',
            validate: (e) => isFQDN(e) || `Must be a valid domain`,
        });

        domain = response.value;

        frontendOutput['VITE_BACKEND_URL'] = 'https://' + response.value;

        console.log('You will need an admin user account in order to manage other users.');
        console.log('You can now enter username, email, password, first name and last name for such account.');
        console.log('If you leave them blank, defaults in square parenthesis [] will be used.');

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Username [admin]',
        });

        username = response.value;
        if (isEmpty(username)) username = 'admin';
        backendOutput['ROOT_USER_USERNAME'] = username;

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Your Email',
            validate: (e) => isEmail(e) || `Must be a valid email`,
        });

        email = response.value;
        backendOutput['ROOT_USER_EMAIL'] = email;

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Password [admin]',
        });

        console.log('Your email will be used to generate a Let\'s Encrypt SSL certificate for the domain.');

        password = response.value;
        if (isEmpty(password)) password = 'admin';
        backendOutput['ROOT_USER_PASSWORD'] = password;

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'First name [Admin]',
        });

        firstName = response.value;
        if (isEmpty(firstName)) firstName = 'Admin';
        backendOutput['ROOT_USER_FIRST_NAME'] = firstName;

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Last name [User]',
        });

        lastName = response.value;
        if (isEmpty(lastName)) lastName = 'User';
        backendOutput['ROOT_USER_LAST_NAME'] = lastName;

        console.log('We need a secret string to encrypt user tokens.');
        console.log('You can input your own (random) set of characters or you can leave blank to generate a random secret.');

        response = await prompts({
            type: 'text',
            name: 'value',
            message: 'Secret [generate random]',
        });

        secret = response.value;
        if (isEmpty(secret)) {
            secret = uuid();
        }
        backendOutput['AUTH_SECRET'] = secret;

        console.log('');
        console.log('Do you want to install nginx reverse proxy and SSL with Let\'s Encrypt?'.cyan);
        console.log('YES if you are running this on a clean server (recommended).');
        console.log('NO if you are running other apps on this machines. You will have to complete the installation manually.');

        response = await prompts({
            type: 'confirm',
            name: 'value',
            message: 'Do you want to install nginx?',
        });

        nginx = response.value;

        if (nginx) {
            console.log('');
            console.log('Your email will be used to generate a Let\'s Encrypt SSL certificate for the domain.'.cyan);
            console.log('It will also be the email related to the admin user account.');

            response = await prompts({
                type: 'text',
                name: 'value',
                message: 'Your Email',
                validate: (e) => isEmail(e) || `Must be a valid email`,
            });

            email = response.value;
        }

        console.log('');
        console.log('Configuration complete!'.green);
        console.log('Will now begin installation'.yellow);
        console.log('');

        let backendOutputString = '';
        let frontendOutputString = '';

        Object.keys(backendOutput).forEach(key => {
            backendOutputString += key;
            backendOutputString += '="';
            backendOutputString += backendOutput[key];
            backendOutputString += '"\n';
        });

        Object.keys(frontendOutput).forEach(key => {
            frontendOutputString += key;
            frontendOutputString += '="';
            frontendOutputString += frontendOutput[key];
            frontendOutputString += '"\n';
        });

        exec(`echo "${backendOutputString}" >> "../backend/.env"`);
        exec(`echo "${frontendOutputString}" >> "../frontend/.env"`);
    }

    if (['setup', 'rebuild'].includes(arg)) {
        response = exec('grep \'^NAME\' /etc/os-release');

        const os = response.toString();

        response = exec('lsb_release -r');

        const version = response.toString();

        if (!os.includes('Ubuntu')) {
            console.log('Current OS is not Ubuntu. Aborting.'.red);
            console.log('If you are running this on Ubuntu, please contact Honeyside Support.');
            return process.exit(0);
        }

        if (!version.includes('22.04') && !version.includes('20.04') && !version.includes('18.04')) {
            console.log('This is not a supported Ubuntu version.'.red);
            console.log('The only supported versions are 22.04 LTS, 20.04 LTS and 18.04 LTS');
            console.log('If you are running this on a correct version, please contact Honeyside Support.');
            return process.exit(0);
        }

        console.log('installing mongo...'.yellow);

        console.log('installing gnupg...');
        exec('sudo apt-get install gnupg -y');
        console.log('adding apt-key for MongoDB...')
        exec('curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor');

        console.log('adding repository for MongoDB...');
        if (version.includes('22.04')) {
            exec('echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list');
        } else if (version.includes('20.04')) {
            exec('echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list');
        } else {
            exec('echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list');
        }

        console.log('apt-get update...');
        exec('sudo apt-get update')
        console.log('apt-get install...');
        exec('sudo apt-get install -y mongodb-org')

        console.log('starting MongoDB...'.yellow);

        console.log('daemon-reload...');
        exec('sudo systemctl daemon-reload');
        console.log('start mongod...');
        exec('sudo systemctl start mongod');
        console.log('enable mongod...');
        exec('sudo systemctl enable mongod');

        console.log('mongo ok'.green);

        console.log('');

        console.log(`${arg === 'setup' ? 'installing' : 'rebuilding'} Clover backend...`.yellow);
        console.log('installing backend node modules...');
        console.log('this might take a while, depending on your machine cpu, ram and connection speed');
        console.log('(might be even 10-15 minutes, please keep calm and wait patiently)');
        exec('cd ../backend && yarn --prod --frozen-lockfile');
        console.log('starting backend...');
        try {
            exec('pm2 delete --silent Clover', {stdio : 'pipe'});
        } catch (e) {}
        exec('cd ../backend && pm2 start index.js --name Clover');
        exec('pm2 save');
        exec('pm2 startup');
        console.log('Clover backend started'.green);

        console.log('');

        console.log(`${arg === 'setup' ? 'installing' : 'rebuilding'} Clover frontend...`.yellow);
        console.log('installing frontend node modules...');
        console.log('this might take a while');
        exec('cd ../frontend && yarn --prod --frozen-lockfile');
        console.log('building frontend...');
        console.log('this might take a while');
        exec('cd ../frontend && yarn build');
        console.log('Clover frontend ok'.green);
    }

    if (arg === 'start') {
        try {
            exec('cd ../backend && pm2 start index.js --name Clover');
        } catch (e) {}
    }

    if (arg === 'restart') {
        try {
            exec('pm2 restart Clover', {stdio : 'pipe'});
        } catch (e) {}
    }

    if (arg === 'stop') {
        try {
            exec('pm2 stop Clover', {stdio : 'pipe'});
        } catch (e) {}
    }

    if (arg === 'setup' && nginx) {
        console.log('');
        console.log('installing nginx...'.yellow);
        try {
            exec('sudo apt-get update');
        } catch (e) {}
        try {
            exec('sudo apt-get install nginx certbot python3-certbot-nginx -y');
        } catch (e) {}
        console.log('configuring nginx...');
        try {
            exec('sudo unlink /etc/nginx/sites-enabled/default');
        } catch (e) {}
        try {
            exec(`echo "server {\n    listen 80 default_server;\n    listen [::]:80 default_server;\n    server_name ${domain};\n    location / {\n        proxy_pass http://localhost:${backendOutput.PORT};\n    }\n}" >> /etc/nginx/sites-available/elderberry.conf`);
        } catch (e) {}
        try {
            exec('sudo ln -s /etc/nginx/sites-available/elderberry.conf /etc/nginx/sites-enabled/elderberry.conf');
        } catch (e) {}
        try {
            exec('service nginx restart');
        } catch (e) {}
        console.log('running certbot...');
        try {
            exec(`sudo certbot --nginx -d ${domain} --non-interactive --agree-tos -m ${email}`);
        } catch (e) {}
        console.log('adding ssl renewal cron job...');
        try {
            exec('(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -');
        } catch (e) {}

        console.log('nginx installation complete'.green);
    }

    if (arg === 'stop') {
        console.log("");
        console.log(`Clover has been stopped.`.green);
        console.log("");
    } else {
        console.log("");
        console.log(`Clover v${pkg.version} ${arg === 'setup' ? 'setup' : 'restart'} complete!`.green);
        if (arg === 'setup') {
            console.log(`You should now be able to access Clover at ${domain}`);
        }
        console.log("");
    }
})();
