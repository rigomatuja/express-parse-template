// Example express application adding the parse-server module to expose Parse
// compatible API routes.

import express from 'express';
import {ParseServer} from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import path from 'path';

const __dirname = path.resolve();
import http from 'http';
import 'dotenv/config'

const {
    APP_ID: appId,
    APP_NAME: appName,
    DATABASE_URI: dbUri,
    CLOUD_CODE_MAIN: cloudCodeMain,
    MASTER_KEY: masterKey,
    JS_KEY: jsKey,
    LIVEQUERY_CLASSES: liveQueryClasses,
    SERVER_URL: serverUrl,
    SERVER_PORT: serverPort,
    PARSE_MOUNT: parseMount,
    DASHBOARD_ADMIN_USER: dashboardAdminUser,
    DASHBOARD_ADMIN_PASS: dashboardAdminPass,
    DASHBOARD_MOUNT: dashboardMount
} = process.env;

export const app = express();
const server = new ParseServer({
    databaseURI: dbUri,
    cloud: cloudCodeMain || __dirname + '/cloud/main.js',
    appId: appId,
    masterKey: masterKey,
    serverURL: `${serverUrl}:${serverPort}${parseMount}`,
    liveQuery: {
        classNames: liveQueryClasses?.split(',') ?? [], // List of classes to support for query subscriptions
    },
});
const dashboard = new ParseDashboard({
    apps: [
        {
            serverURL: `${serverUrl}:${serverPort}${parseMount}`,
            appId: appId,
            masterKey: masterKey,
            appName: appName,
        }
    ],
    users: [
        {
            user: dashboardAdminUser,
            pass: dashboardAdminPass
        },
    ],
}, {allowInsecureHTTP: false});

await server.start();

app.use(parseMount, server.app);
app.use(dashboardMount, dashboard);

const httpServer = http.createServer(app);
httpServer.listen(serverPort, function () {
    console.log(`${appName} running on port ${serverPort}.`);
});
// This will enable the Live Query real-time server
await ParseServer.createLiveQueryServer(httpServer);
