# nitesky

A Bluesky client mod.

> [!WARNING]
>
> **This is not meant for end users.** I designed nitesky for myself and people who can debug when something goes wrong. It's also mostly a proof of concept and there aren't a lot of features. If you are expecting a polished Bluesky mod, this isn't it.
>
> I will not help you troubleshoot installing or building nitesky. nitesky may break or cause issues with the site, and I cannot promise I will fix those issues immediately. However, I have been using it daily for several months without issue. You've been warned.
>
> ![Gif of a guy working with various power tools](https://hl2.sh/guy_constructing_the_thing.gif)

## Motivation

I like modding the apps I use. Bluesky's [social-app](https://github.com/bluesky-social/social-app) is open source, so modding Bluesky might seem a little silly when the code is right there. However, I don't want to maintain a fork. I'd have to constantly merge new updates from upstream and then build and host it somewhere.

nitesky is a lot more unstable and a lot less flexible, but it's a tradeoff.nitesky uses [webpackTools][webpackTools] to dynamically patch the minified JavaScript. It works on my browser locally, without having to recompile the web app, and it's faster to fix when it breaks.

## Installation

> [!WARNING]
>
> Don't spam Bluesky team with your errors. Block Sentry from making requests (e.g. [uBlock Origin](https://ublockorigin.com/)). This isn't a requirement, but you should it [because they ask nicely](https://github.com/bluesky-social/social-app?tab=readme-ov-file#forking-guidelines).

nitesky can be installed using a userscript manager by going to <https://notnite.github.io/nitesky/nitesky.user.js>. There's no update checking, so make sure to go back to the script and update it manually if your userscript manager doesn't do it for you.

## Settings

nitesky doesn't have a GUI for settings (yet?), just edit `nitesky-settings` in localStorage. Available keys:

- `customAccent`: Use a custom theme for the site (e.g. `CB2027`)
- `noJpeg`: Use PNG instead of JPG when loading images, will cause images to load slower (default: true)
- `forceDidLink`: Copies links with the user's DID instead of their handle (default: true)

## Building

```shell
git clone https://github.com/NotNite/nitesky.git
cd nitesky
npm i
npm run build
```

For building nitesky, just run `npm run build` and add `nitesky.user.js` to your userscript manager. You can get hot reload with `npm run dev`, a local web server (e.g. `npx serve`), and a userscript manager that can poll for updates (e.g. Violentmonkey's "Track external edits" button).

It's suggested to use Chrome for developing because it has better DevTools for inspecting Webpack modules. The build system is a hacked together abomination using esbuild, based off of [moonlight][moonlight]'s old build scripts. The [webpackTools][webpackTools] runtime is updated by hand when I feel like it. For contributing, please format with [dprint](https://dprint.dev/). There's also ESLint but I don't really care about it to be honest.

## Credits

nitesky uses [webpackTools][webpackTools] for patching. Some other code (build script/types) is taken from [moonlight][moonlight].

[webpackTools]: <https://github.com/moonlight-mod/webpackTools>
[moonlight]: <https://github.com/moonlight-mod/moonlight>
