<div align="center">
	<img src="static/logo.svg?sanitize=true" width="160" height="160" alt="logo">
	<h1>Alexandrite</h1>
</div>

[Alexandrite](https://alexandrite.app/) is a beautiful desktop-first alternative web UI for [Lemmy](https://join-lemmy.org/), a social link aggregator and discussion forum for the [Fediverse](https://simple.wikipedia.org/wiki/Fediverse).

Alexandrite comes packed full of features!

- Infinite scrolling
- View posts in an overlay or side-by-side with the feed in a second column so you don't lose your spot
- Customizable theme hue
- Powerful account switcher, login to different accounts across the same or different instances simultaneously in different browser tabs
- Most mod tools
- Supports most markdown formatting

## Support Development

A lot of time and effort has gone into Alexandrite. If you would like to support development you can [Buy Me a Coffee](https://www.buymeacoffee.com/sheodox). I really appreciate all the support!

## Self Hosting

Alexandrite supports self hosting with a few configuration options. Check out the [example environment variable config](.env.example) to see what options can be passed as arguments to `docker`.

### Using Docker

The easiest way to host Alexandrite would be using a prebuilt image, or building from source using the provided [Dockerfile](Dockerfile).

The app listens inside the container to port `3000` and doesn't provide HTTPs, you'll probably want to configure your own reverse proxy between the internet and Alexandrite to provide HTTPS.

Run using:

```bash
docker run -p 3000:3000 ghcr.io/sheodox/alexandrite:latest
```

Or, with some customized options:

```bash
docker run -p 3000:3000 --env 'ALEXANDRITE_DEFAULT_INSTANCE=programming.dev' ghcr.io/sheodox/alexandrite:latest
```

Or as part of a docker compose setup:

```yaml
version: '3.7'
services:
  # ...
  alexandrite:
    image: ghcr.io/sheodox/alexandrite:latest
    ports:
      - 3000:3000
    environment:
      # example config only allowing logins to example.com
      # with no links to Lemmy docs, or an instance list
      ALEXANDRITE_DEFAULT_INSTANCE: example.com
      ALEXANDRITE_WELCOME_LEMMY_HELP: false
      ALEXANDRITE_WELCOME_INSTANCE_HELP: false
      ALEXANDRITE_FORCE_INSTANCE: example.com
```

### Serverless

You can alternatively host Alexandrite on the serverless platforms supported by [Sveltekit's `adapter-auto`](https://kit.svelte.dev/docs/adapter-auto). It should be pretty low on resource usage, as SSR is disabled.

## Contributing

PRs are welcome! The app is written in [Svelte](https://svelte.dev/) using [Sveltekit](https://kit.svelte.dev/), running with SSR disabled, as all interactions with Lemmy are done client-side using [`lemmy-js-client`](https://github.com/LemmyNet/lemmy-js-client).

One small warning, I really enjoy figuring out how things work and doing things myself for the learning experience instead of using third party libraries. The UI is written using my own very sparsely documented [UI/component library](https://github.com/sheodox/sheodox-ui) that is a mix of pre-built components and Bootstrap/Tailwind-like utility classes. The [virtualized list renderer](src/lib/VirtualFeed.svelte) is also custom built.
