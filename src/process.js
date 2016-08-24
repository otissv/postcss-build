import fs from 'fs';
import postcss from 'postcss';
import shell from 'shelljs';
import {
  flatten,
  forEachPromise,
} from './utils';
import {
  errorReporter,
  successMessage,
  wathchingMessage
} from './messages.js';


export default function process ({ NOTIFY, OPTIONS, OUTPUT, PLUGINS, WATCH }) {
  // memorization
  let changedFile;
  let cacheContent = {};

  const {
    echo,
  } = shell;

  // Process postcss
  function processCSS (css) {
    postcss(...PLUGINS.map(plugin => require(plugin)(OPTIONS[plugin])))
      .process(css)
      .then(function (result) {

        if (result.messages.length > 0) {
          errorReporter(NOTIFY, result.messages.map(mes => {
            return {
              pos:  mes.line && mes.column ? `Line ${mes.line}:${mes.column}` : '',
              type: mes.type,
              text: mes.text,
              plugin: mes.plugin
            };
          }));

        } else {
          fs.writeFile(OUTPUT, result.css);
          successMessage(NOTIFY);
          wathchingMessage(WATCH);
        }

      })
      .catch(function (error) {
        errorReporter(NOTIFY, [{
          pos:  `${error.line}:${error.column}`,
          type: error.reason,
          plugin: error.name
        }]);
      });
  }


  return {
    getFileContents (err, filePaths) {

      if (err) return echo(err);
      const flattenfilePaths = flatten(filePaths);

      const fn = (resolve, file, index, arr) => {
        if (changedFile == null || changedFile === file) {
          fs.readFile(file, 'utf8', function (err, data) {
            if (err) return echo(err);
            cacheContent[file] = data;
            resolve(cacheContent);
          });

        } else {
          resolve(cacheContent);
        }
      };


      forEachPromise(fn)(flattenfilePaths)
        .then(results => {
          processCSS(flattenfilePaths.map(i => results[0][i]).join(''));
        })
        .catch(err => echo(err));
    },

    setChangedFile (file) {
      changedFile = file;
    }
  };

}
