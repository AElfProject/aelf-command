const chalk = require('chalk');

// - TRACE: The unimportant detail about how the process run. You may hardly use it.
// - DEBUG: A debug message for processing information to help during troubleshooting.
// - INFO: Generally useful information to log (service start/stop, configuration assumptions, etc).
// - WARN: Anything that can potentially cause application oddities.
// - ERROR: The system is unusable.
const levels = [
  {
    level: 'Trace',
    color: chalk.gray
  },
  {
    level: 'Debug',
    color: chalk.hex('#D3D3D3')
  },
  {
    level: 'Info',
    color: chalk.blue
  },
  {
    level: 'Warn',
    color: chalk.yellow
  },
  {
    level: 'Error',
    color: chalk.hex('#CF6679')
  },
  {
    level: 'Fatal',
    color: chalk.red
  }
];

class Logger {
  constructor(props) {
    this.symbol = '';
    this.name = '';
    this.log = props.log !== undefined ? props.log : true; // determin whether console.log or not
    if (!props.onlyWords) {
      this.symbol = '⬡';
      this.name = props.name;
    }
  }
}

// The Logger's prototype's method 'info' 'warn' etc. are compatible with console.log
// So you can use it as console.log
levels.forEach(item => {
  const { level, color } = item;
  const fnName = level.toLocaleLowerCase();
  Logger.prototype[fnName] = function fn(firstParam, ...rest) {
    // if (typeof params === 'obejct') params = JSON.stringify(params);
    // eslint-disable-next-line prefer-template
    let prefix = `${this.symbol ? this.symbol + ' ' : ''}${this.name ? this.name + ' ' : ''}[${level}]: `;
    if (typeof firstParam === 'object' && firstParam !== null) {
      prefix += '\n';
      if (this.log) {
        console.log(color(prefix), firstParam, ...rest);
      }
      return chalk(color(prefix), firstParam, ...rest);
    }
    // To compatible with the situation below, We need to surround the rest with method color
    // logger.error('Your Node.js version is needed to >= %s', '10.1');
    if (this.log) {
      console.log(color(prefix + firstParam), color(...rest));
    }
    return chalk(color(prefix + firstParam), color(...rest));
  };
});

module.exports = Logger;
