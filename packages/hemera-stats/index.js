'use strict'

exports.plugin = function hemeraStats () {
  const hemera = this
  const topic = 'stats'

  hemera.add({
    topic,
    cmd: 'processInfo',
    pubsub$: true
  }, function (resp, cb) {
    const info = {
      app: hemera.config.name,
      eventLoopDelay: hemera.load.eventLoopDelay,
      heapUsed: hemera.load.heapUsed,
      rss: hemera.load.rss,
      nodeEnv: process.env.NODE_ENV,
      uptime: process.uptime(),
      ts: Date.now()
    }

    cb(null, info)
  })

  hemera.add({
    topic,
    cmd: 'registeredActions',
    pubsub$: true
  }, function (resp, cb) {
    const info = {
      app: hemera.config.name
    }

    const list = hemera.list()
    info.ts = Date.now()
    info.actions = list.map((a) => {
      const schema = {}

      // only for joi schemas
      for (var key in a.schema) {
        if (a.schema.hasOwnProperty(key)) {
          var element = a.schema[key]
          if (element.isJoi) {
            schema[key] = {
              description: element._description,
              notes: element._notes,
              tags: element._tags,
              default: element._flags.default,
              required: element._flags.presence === 'required',
              examples: element._examples
            }
          }
        }
      }

      return {
        pattern: a.pattern,
        schema: schema,
        plugin: a.plugin.attributes.name
      }
    })

    cb(null, info)
  })
}

exports.options = {}

exports.attributes = {
  pkg: require('./package.json')
}
