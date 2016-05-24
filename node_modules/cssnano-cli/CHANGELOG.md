# 1.0.4

* Resolves an issue where external source maps were not being properly handled
  by this module. Now, cssnano-cli will generate an external map when the `map`
  flag is passed, and an output file is set.

# 1.0.3

* Adds missing documentation for the `safe` option.

# 1.0.2

* Fixes an issue where passing the sourcemap option as anything but the last
  parameter caused the output file to be lost.

# 1.0.1

* Fixes a crash when trying to read the version from `package.json`.

# 1.0.0

* Initial release.
