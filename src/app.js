require('./connection/db')
require('dotenv').config()
require('./services/cronJob/userSubscriptionCron')

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const i18n = require('./i18n/i18n')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const helmet = require("helmet")
const { PORT, IS_SSL } = require('../config/key')
const http = require('http')
const https = require("https");
const server = http.createServer(app)
const { stream } = require('../src/helpers/loggerService')
const fs = require("fs")

if (IS_SSL === 'true') {
    const options = {
        key: fs.readFileSync('/var/www/ssl/multiqos.com.key'),
        cert: fs.readFileSync('/var/www/ssl/X509.crt'),
        ca: fs.readFileSync('/var/www/ssl/ca-bundle.crt')
    };
    const httpsServer = https.createServer(options, app);
    httpsServer.listen(8024, () => {
        console.log("server listening on port:", 8024);
    });
} else {
    // server
    server.listen(PORT, () => {
        console.log('server listening on port:', PORT)
    })
}

// public path
const publicDirectory = path.join(__dirname, '../')
app.use(express.static(publicDirectory))

// view engine
app.set('views', path.join(__dirname, 'views'))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

app.set('view engine', 'ejs')
app.use(helmet())
app.use(helmet.hsts({ maxAge: 300, includeSubDomains: true, preload: true }));
app.use(express.json())
app.use(
    express.urlencoded({
        extended: true
    })
)
app.use(function(req, res, next) {
    res.setHeader("X-XSS-Protection", "1");
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', `frame-src 'none'; object-src 'none'; script-src 'self'; style-src 'self';`);

    next();
});
app.set('trust proxy', 1)

// cors
app.use(cors())
app.options('*', cors())

// logger
app.use(morgan('combined', { stream: stream }))

// language file
app.use(i18n)

app.get('/', (req, res) => {
    res.send('Testing from the node staging')
})

const user = require('./routes/api/v1/userAuth.route')
app.use('/api/v1/user', user)

const admin = require("./routes/admin/admin.route");
app.use("/admin", admin);

const adminClient = require("./routes/admin/client.route");
app.use("/admin/client", adminClient);

const userAdmin = require("./routes/admin/user.route");
app.use("/admin/user", userAdmin);

const segment = require("./routes/admin/segment.route");
app.use("/admin/segment", segment);

const subAdmin = require("./routes/admin/subAdmin.route");
app.use("/admin/sub-admin", subAdmin);

const marketTipAdmin = require("./routes/admin/marketTip.route");
app.use("/admin/market-tips", marketTipAdmin);

const scriptAdmin = require("./routes/admin/script.route");
app.use("/admin/script", scriptAdmin);

const dashboard = require("./routes/admin/dashboard.route");
app.use("/admin/dashboard", dashboard);

const closingRate = require("./routes/admin/closingRate.route");
app.use("/admin/closing-rate", closingRate);

const client = require("./routes/client/client.route");
app.use("/client", client);

const service = require("./routes/webhook/service.route");
app.use("/service", service);

const clientUser = require("./routes/client/user.route");
app.use("/client/user", clientUser);

const clientDashboard = require("./routes/client/dashboard.route");
app.use("/client/dashboard", clientDashboard);

module.exports = app;