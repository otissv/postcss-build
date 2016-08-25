import path from 'path';
import shell from 'shelljs';

// flatten array
export function flatten (arr) {
  return arr.reduce((a, b) => [...a.concat(b)], []);
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
