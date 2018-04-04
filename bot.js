'use strict'

require('dotenv').config()

const yargs = require('yargs')
const mockery = require('mockery')
const playbook = require('nubot-playbook')
const Nubot = require('./src')
mockery.enable({ warnOnReplace: false, warnOnUnregistered: false })
mockery.registerSubstitute('hubot', 'nubot') // to support legacy adapters

// TODO: add tests to ensure promises resolve when adapter connects and brain
// loads, and fix probable untested issue, where they won't if there's no
// connection required by either the adapter or the brain
// TODO: refactor arguments as options object, accept brain connector ala adapter
/*Nubot.start = function (options) {
  let config = Object.assign({}, args, options)
  const robot = Nubot.loadBot(
    config.adapter,
    config.storageAdapter,
    config.httpd,
    config.name,
    config.alias,
    config.logLevel
  )
  let brainReady = new Promise((resolve) => robot.brain.once('connected', resolve))
  let adapterReady = new Promise((resolve) => robot.adapter.once('connected', resolve))
  let robotReady = Promise.all([brainReady, adapterReady]).then(() => {
    playbook.use(robot) // make playbook available to all scripts
    robot.loadScripts('./src/plugins')
    //robot.loadScripts(config.scripts)
    //robot.loadPackages(config.scripts)
    return robot
  })
  robot.run()
  return robotReady
}*/


// Pass command line args and env vars to produce options object

const args = yargs
  .usage('\nUsage:                      $0 [args]')
  .env('HUBOT')
  .pkgConf('botConfig')
  .option('chatAdapter', {
    alias: ['adapter', 'a', 'c'],
    type: 'string',
    describe: 'The adapter name to use.\nIf its not a default adapter it will require from node modules with "hubot-" prefix.\n',
    default: 'chat/shell'
  })
  .example('adapter', 'bin/nubot -a rocketchat (will require "hubot-rocketchat")')
  .option('storageAdapter', {
    alias: 's',
    type: 'string',
    describe: 'The package name to require for storing brain data key-value pairs (e.g. to Redis or MongoDB)',
    default: 'storage/filesystem'
  })
  .option('log-level', {
    type: 'string',
    describe: 'The starting minimum level for logging events (silent|degug|info|warning|error).\n',
    default: 'info'
  })
  .option('httpd', {
    type: 'boolean',
    describe: 'Enable the HTTP server.\nThis option added to keep cli args consistent with internal options.\n',
    default: false
  })
  .option('disable-httpd', {
    alias: 'd',
    type: 'boolean',
    describe: 'Disiable the HTTP server.\nFor compatibility with hubot v2 args, overrides `http` if both set.\n',
    default: true
  })
  .option('name', {
    alias: 'n',
    type: 'string',
    describe: 'Name of the robot in chat.\nPrepending any command with the robot\'s name will trigger respond listeners.\n',
    default: 'nubot'
  })
  .option('alias', {
    alias: 'l',
    type: 'string',
    describe: 'Alternate name for robot.\n',
    default: '!'
  })
  .option('scripts', {
    alias: ['require', 'r'],
    type: 'array',
    describe: 'Alternative scripts paths\n',
    default: 'scripts'
  })
  .option('coffee-script', {
    type: 'boolean',
    describe: 'Enable coffeescript support',
    default: false
  })
  .config()
  .alias('config', 'c')
  .example('config', 'bin/nubot -c bot-config.json')
  .version(() => require('./package.json').version)
  .alias('version', 'v')
  .help()
  .alias('help', 'h')
  .epilogue('Any option can be provided as an environment variable, with the prefix HUBOT_\nConfig can also be declared in package.json with the key: "botConfig"\nFor more information, see https://propertyux.github.io/nubot')
  .check((yargs) => {
    if (yargs.disableHttpd) {
      yargs.httpd = !yargs.disableHttpd
    }
    return yargs
  })
  .fail(function (msg, err) {
    console.error('ERROR: ' + msg)
    console.error('Start with --help for config argument info.')
    if (err) throw err // preserve stack
    process.exit(1)
  })
  .argv

if (args.coffeeScript) {
  const coffeeClass = require('./coffee-class')
  Nubot = coffeeClass(Nubot);
}

Nubot.runBot({
  chatAdapter: args.chatAdapter,
  storageAdapter: args.storageAdapter,
  httpd: args.httpd,
  name: args.name,
  alias: args.alias,
  logLevel: args.logLevel,
  coffeeScript: args.coffeeScript
})
