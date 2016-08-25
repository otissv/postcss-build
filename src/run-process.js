import fs from 'fs';
import postcss from 'postcss';
import shell from 'shelljs';
import mapPromise from 'map-async-promise';
import {
  flatten,
  mkDir
} from './utils';
import {
  errorReporter,
  successMessage,
  wathchingMessage
} from './messages.js';


function pathDetails (file, from, to) {
  const pathFile = file.split(from)[1];
  const fileName = pathFile.replace(/^.*(\\|\/|\:)/, '');
  const split = file.indexOf('/') != -1 ? `/` : '\\';
  const dest = to.concat(pathFile.match(/(.*)[\/\\]/)[1]||'');

  return {
    fullPath: `${dest}${split}${fileName}`,
    srcFrom: dest,
    srcTo: `${to}${split}${fileName}`
  };
}


export default function runProcess ({ FROM, MAP, NOTIFY, OPTIONS, OUTPUT, PLUGINS, TO, WATCH }) {
  let changedFile;
  let cacheFile = {};
  let cachePostCSS = {};
  let fileOrder = [];

  const {
    echo,
  } = shell;


  function concat (obj) {

    const writeFile = (output, content) => {
      fs.writeFile(output, content, err => {
        if (err) throw err;
        successMessage(NOTIFY);
      });
    }


    if (OUTPUT) {
      writeFile(OUTPUT, fileOrder.map((item, index) => obj[item].css).join(''));
      successMessage(NOTIFY);
    } else {
      const fn = (resolve , file) => {
        const { fullPath, srcFrom } = pathDetails(file, FROM, TO);

        if (srcFrom !== TO ) {
          mkDir(srcFrom);
        }

        writeFile(fullPath, obj[file].css);

        if (MAP && typeof MAP.inline === 'boolean'  && MAP.inline === false) {
          writeFile(`${fullPath}.map`, obj[file].map.toString());
        }


        resolve();
      };

      mapPromise(fn)(fileOrder)
        .then(() => {
          successMessage(NOTIFY);
        })
        .catch(err => echo(err));
    }

    wathchingMessage(WATCH);
  }


  function processCSS () {
    const fn = (resolve, file) => {
      const css = cacheFile[file];

      if (changedFile == null || changedFile === file) {
        const { srcTo } = pathDetails(file, FROM, TO);
        let opts = {
          from: file,
          to: `${srcTo}`,
          map: {}
        };

        if (MAP && MAP.inline === false) {
          opts.map.inline = false;

        } else if (MAP || MAP && MAP.inline === true) {
          opts.map.inline = true;
        }


        postcss(...PLUGINS.map(plugin => require(plugin)(OPTIONS[plugin])))
          .process(css, opts)
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
              cachePostCSS[file] = { css: result.css, map: result.map };
              resolve(cachePostCSS);
            }
          })
          .catch(function (error) {
            errorReporter(NOTIFY, [{
              pos:  `${error.line}:${error.column}`,
              type: error.reason,
              plugin: error.name
            }]);
          });

        } else {
          resolve(cachePostCSS);
        }
    };


    mapPromise(fn)(fileOrder)
      .then(results => {
        concat(results[0]);
      })
      .catch(err => echo(err));
  }


  function getFileContents () {
    const readFiles = (resolve, file, index, arr) => {
      if (changedFile == null || changedFile === file) {
        fs.readFile(file, 'utf8', function (err, data) {
          if (err) return echo(err);
          cacheFile[file] = data;
          resolve(cacheFile);
        });
      } else {
        resolve(cacheFile);
      }
    };


    mapPromise(readFiles)(fileOrder)
      .then(() => {
        processCSS();
      })
      .catch(err => echo(err));
  }


  return {
    proccessFiles (err, filePaths) {
      if (err) return echo(err);
      fileOrder = flatten(filePaths);

      getFileContents();
    },

    setChangedFile (file) {
      changedFile = file;
    }
  };
}
