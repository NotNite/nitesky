# nitesky

A Bluesky client mod.

> [!WARNING]
>
> This isn't meant for end users, this is mostly just my own personal tweaks. It's also mostly a proof of concept and doesn't have any features at the moment. PRs welcome :)
>
> ![Gif of a guy working with various power tools](https://hl2.sh/guy_constructing_the_thing.gif)

---

Modding sites is fun! [Open source apps are more fun!](https://github.com/bluesky-social/social-app) But sometimes there are ideas that don't deserve a PR, and forking + hosting can be too much effort for a silly project idea. This is a userscript that should hopefully make it easy to pull off those silly ideas.

## Building

> [!WARNING]
>
> Install an extension like [Privacy Badger](https://privacybadger.org/) to block Sentry from making requests. Don't spam the Bluesky team with your errors.

Clone and run the build script:

```shell
git clone https://github.com/NotNite/nitesky.git
cd nitesky
npm i
npm run build
```

For normal usage, add `nitesky.user.js` to your userscript manager. If you have a webserver (e.g. `npx serve`), you can get live reload using [Violentmonkey](https://violentmonkey.github.io/) and `npm run dev`.

## Credits

nitesky uses [webpackTools](https://github.com/moonlight-mod/webpackTools) for patching, and some code (build script/types) is taken from [moonlight](https://github.com/moonlight-mod/moonlight).
