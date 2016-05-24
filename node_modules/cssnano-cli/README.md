# [cssnano]-cli [![Build Status](https://travis-ci.org/ben-eb/cssnano-cli.svg?branch=master)][ci] [![NPM version](https://badge.fury.io/js/cssnano-cli.svg)][npm] [![Dependency Status](https://gemnasium.com/ben-eb/cssnano-cli.svg)][deps]

> A CLI for modular minifier [cssnano].

## Install

With [npm](https://npmjs.org/package/cssnano-cli) do:

```
npm install cssnano-cli --global
```

You can also install cssnano-cli as a development dependency of your project,
and get the command by this snippet in your .bashrc:

```
export PATH=$PATH:./node_modules/.bin
```

## Usage

```
$ cssnano --help

Usage: cssnano [input] [output] {OPTIONS}

Options:

    --sourcemap,  -s    Generate a sourcemap within the minified output.

    --no-[featureName]  Disable any individual processor module by its name.
                        [featureName] can be any one of these:

                        autoprefixer        filterOptimiser     normalizeUrl
                        calc                filterPlugins       orderedValues
                        colormin            functionOptimiser   reduceIdents
                        convertValues       mergeIdents         singleCharset
                        core                mergeLonghand       styleCache
                        discardComments     mergeRules          svgo
                        discardDuplicates   minifyFontValues    uniqueSelectors
                        discardEmpty        minifyParams        zindex
                        discardUnused       minifySelectors

    --safe              Disable advanced optimisations that are not always safe.
                        Currently, this disables custom identifier reduction,
                        z-index rebasing, unused at-rule removal & conversion
                        between absolute length values.


    --version,    -v    Outputs the version number.

    --help,       -h    Outputs this help screen.
```

You can also use stdin & stdout redirections:

```
cssnano < main.css > main.min.css
```

## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests
to cover it.

## License

MIT © [Ben Briggs](http://beneb.info)

[ci]:      https://travis-ci.org/ben-eb/cssnano-cli
[deps]:    https://gemnasium.com/ben-eb/cssnano-cli
[npm]:     http://badge.fury.io/js/cssnano-cli
[cssnano]: https://github.com/ben-eb/cssnano