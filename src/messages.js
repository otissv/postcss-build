import notifier from 'node-notifier';
import shell from 'shelljs';
import chalk from 'chalk';

const {
  echo
} = shell;


export function errorReporter (NOTIFY, errors) {
  // remove duplicate errors
  [...new Set(errors)].forEach(mes => {
    const pos = mes.pos ? `Line ${mes.pos}` : '';
    const type = mes.type ? mes.type : '';
    const text = mes.text ? mes.text : '';
    const plugin = mes.plugin ? mes.plugin : '';

    const messageColor = (type) => {
      return type === 'warning' ? 'yellow' : 'red';
    };

    let color = messageColor(type);

    const typeColor = chalk[color](`${type}`);
    const pluginColor = chalk[color](`${plugin}`);

    echo(chalk.red('PossCSSBuild Error'));
    echo(`${pos} [${pluginColor}] ${typeColor}`);
    echo(chalk[color](`${text}`));
  });


  // System notification
  if (NOTIFY) {
    notifier.notify({
      title: 'PostCSS Build',
      message: 'Error'
    });
  }
}


export function successMessage (NOTIFY) {
  echo(chalk.cyan('PossCSS Build success'));

  if (NOTIFY) {
    notifier.notify({
      title: 'PostCSS Build',
      message: 'Success'
    });
  }
}


export function wathchingMessage (WATCH) {
  if (WATCH) echo(`Watching files in ${WATCH}\n`);
}
