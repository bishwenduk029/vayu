![alt text](vayu.png "Vayu")
![experimental](https://raster.shields.io/badge/status-experimental-red.png)

A minimal, fast and content first static site generator with support for multiple templates like JSX, PUG etc.
Content is a first class citizen in Vayu. Everything starts with content. Even so that content is the starting point of any static site developed with Vayu like index.md(kind of like index.js in a JS project).

### Installation

```
yarn add vayu
```

### Getting Started

Say you have a folder with all your .md files. You want to generate a website that is having the same structure as the folder structure of your .md files. Well then just start as follows:

```
cd <you-folder-containing-md-files>
vayu build
```

And with just this your .md files will be rendered into plain HTML, CSS & JS website in the `./public` folder which you can view in browser or deploy to any CDN. Also the rendered website will have the same structure as the folder structure of your .md files.
The website is rendered using a very minimal template shipped out of the box in Vayu.
