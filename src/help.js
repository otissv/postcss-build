import shell from 'shelljs';


export default function help () {
  const {
    echo,
    exit,
  } = shell;

		echo(`Usage: postcssbuild <command>

where <command> is one of:
\t-c, --config, -d, --dir, -e, --ext, -h, --help, -s, --src,
\t-t, --options, -o, --output, -p, --plugins,

postcssbuild -c or --config\t /path/to/file\t\t Configuration file
postcssbuild -e or --ext\t\t\t\t File extention defaults to .css
postcssbuild -d or --dir\t /path/to/folder\t Source directory
postcssbuild -h or --help\t\t\t\t Displays this help text
postcssbuild -n or --notify\t\t\t\t System nofifications
postcssbuild -o or --output\t /path/to/file\t\t Output file
postcssbuild -p or --plugins\t ['plugin', 'names']\t Postcss plugins
postcssbuild -s or --src\t [/path/to/file]\t Source file(s)
postcssbuild -t or --options\t\t\t\t Plugin options
postcssbuild -w or --watch\t /path/to/watch\t\t Watches directory for changes
	`);
	exit();
}
