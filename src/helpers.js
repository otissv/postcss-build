import path from 'path';
import shell from 'shelljs';

// flatten array
export function flatten (arr) {
  return arr.reduce((a, b) => [...a.concat(b)], []);
}


// forEach async
export function forEachPromise (fn) {
  return function (arr) {
    let contents = arr.map((item, index) => {
      return new Promise((resolve) => {
        fn(resolve, item, index, arr);
      });
    });

    return Promise.all(contents).then(res => [...new Set(res)]);
  };
}


// Create directories
export function mkDir (paths) {
  const {
		echo,
		error,
		ls,
		mkdir,
	} = shell;

  if (Array.isArray(paths)) {
    paths.forEach(path => {
      if (ls(path) && error()) {
        echo(`Creating directory ${path}`.blue);
        mkdir('-p', path);
      }
    });
  } else {
    if (ls(paths) && error()) {
      echo(`Creating directory ${path}`.blue);
      mkdir('-p', paths);
    }
  }
}
