
# analyze-this-webpack-build-plz
An in-progress tool for better visualizing and analyzing Webpack's stats.json output files.

In particular, it attempts to make it easier to visualize the "modules" and "chunks" sections of stats.json files.  If you don't HAVE these keys in your `stats.json` file, you probably need to update your webpack config to output them.

# Usage
```bash
git clone git@github.com:gjtrowbridge/analyze-this-webpack-build-plz.git
npm install
npm run start
# Go to localhost:8080 in your favorite browser
```
This is still VERY in-progress, so if things break let me know and I'll fix them (or possibly I'm already working on them)

There IS a webpack dev server command in package.json, but YMMV with it because it sometimes seems to struggle with proxying large files. `npm run start` is more likely to work consistently for now.


