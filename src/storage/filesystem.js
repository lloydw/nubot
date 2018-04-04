'use strict'
var fs = require('fs');
var path = require('path');

function adapter(robot) {
  var filePath = process.env.HUBOT_BRAIN_FILE_PATH || path.join(path.dirname(__filename), '../../../', 'hubot_brain.json');

  robot.brain.setAutoSave(false);

  robot.brain.on('save', (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
  })

  fs.readFile(filePath, 'utf8', (err, data) => {

    if (!err) {
      robot.logger.info('hubot-filesystem-brain: Data for hubot brain retrieved from File System');
      robot.brain.mergeData(JSON.parse(data.toString()));
    } else {
      robot.logger.info('hubot-filesystem-brain: Initializing new data for hubot brain');
      robot.brain.mergeData({});
    }

    robot.brain.setAutoSave(true);
    robot.brain.emit('connected');
  });
}

module.exports = adapter