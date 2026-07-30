# Unblended

**Live at [unblended.org](https://unblended.org)**

A small, phone-first web app that walks you through an **Internal Family Systems
unblending session**: noticing a part, getting some room around it, and finding
out what it is actually protecting.

No build step, no dependencies, no accounts, no network. Open `index.html` and it
works. Everything you write stays in `localStorage` on the device.

## Why it exists

IFS is easy to read about and hard to run on yourself in the moment a part is
already driving. The steps are simple enough to memorise and yet the exact moment
you need them is the moment you are least able to recall them. This is a set of
rails for that moment.

## What is in it

| Tab | What it does |
|---|---|
| **Unblend** | The session. A grounding breath, then the six steps, then a choice. |
| **Parts** | The ones you have met, with what each protects and how you know it is here. |
| **Journal** | Finished sessions, kept so you can look back and spot the pattern. |
| **Learn** | Short answers to what a part is, what Self is, and what blended means. |

## The session

Follows Richard Schwartz's **six Fs**, with a four-round breath as the entry
step because arriving matters more than starting fast.

1. **Find** - where do you notice it, in or around the body
2. **Focus** - stay with it, do not fix it
3. **Flesh it out** - age, posture, tone of voice
4. **Feel toward** - the pivot, see below
5. **beFriend** - tell it you heard it, ask what it wants you to know
6. **Fear** - what is it afraid would happen if it stopped

### Step 4 is the whole mechanism

The question is not how the part feels. It is how **you** feel toward the part.

- Curious, warm, or calm means Self is present, and you can carry on.
- Irritated, frightened, or "I want it gone" means a **reactive part** has arrived
  and is now driving.

In the second case the app does not push you forward. It turns you toward the
reactive part and gives you the ask: *would you give me a little room, I am not
going to let the first part take over*. Then it re-asks. That loop is unblending, and everything else
here is scaffolding around it.

## Deliberate limits

- **It stops at protectors.** It never directs anyone toward an exile. That is
  correct IFS practice for unguided work, and it is the difference between a
  useful self-help tool and one that can knock someone flat.
- **It is not therapy** and says so, with a crisis pointer in the Learn tab.
- **It does not diagnose, score, or gamify.** No streaks, no badges. A tool for
  noticing should not add another part that needs to perform.

## Running it

```sh
python3 -m http.server 8080
# then open http://localhost:8080
```

A plain `file://` open works too, minus the service worker. For the phone, serve
it over the network and use "Add to Home Screen" for a standalone window.

## Data

One `localStorage` key, `unblended.v1`:

```jsonc
{
  "version": 1,
  "settings": { "theme": "auto" },
  "parts":   [{ "id", "name", "protects", "trigger", "cue", "created", "updated" }],
  "entries": [{ "id", "created", "partName", "feeling", "partial", "answers" }],
  "draft":   null
}
```

An unfinished session is held in `draft` and offered back on the next open, so
closing the tab mid-session costs nothing.

**Export and Import** are in the Journal tab. Clearing browser data erases
everything, so a copy now and then is worth it. Import merges rather than
overwrites, matching entries on id and parts on name.

## Design notes

- Mobile first, capped at 30rem and centred on anything wider.
- Bottom tab bar, everything inside thumb reach, safe-area insets respected.
- Warm clay and sage on paper. Friendly, deliberately not cheerful; the app is
  used on bad days and should not be chirpy at someone having one.
- No emoji anywhere. Icons are inline stroke SVG in a symbol sprite.
- Light and dark, following the system by default, with a three-way manual
  toggle. `prefers-reduced-motion` shortens the breath and drops transitions.

## No AI, and that is the point

Nothing you write is sent to a language model. There is no model, no API key, no
inference of any kind. The prompts are fixed, written in advance, identical for
everyone, and nothing you type is interpreted, scored, rewritten or summarised.
The app does arithmetic on the numbers you tap and nothing else.

Verifiable rather than promised:

```sh
grep -rE "fetch\(|XMLHttpRequest|WebSocket|sendBeacon" *.js *.html   # nothing
grep -roE "https?://[^\"' )]+" *.js *.html *.css                     # one link, to a crisis-line directory
ls node_modules                                                       # does not exist
```

Other apps in this space do use models and charge a subscription to cover the
bill. That is a fair trade for anyone who wants it. This one made the opposite
choice, which is also why it is free: there is no cost to pass on.

## Live

**https://derekablackburn.com/unblended/**

Add it to your home screen and it runs like an app, offline included.

## Deploying it

Static files, so anything that serves a directory will do. For **GitHub Pages**:

```sh
gh repo create <name> --public --source=. --remote=origin --push
gh api -X POST repos/<user>/<name>/pages -f "source[branch]=main" -f "source[path]=/"
gh api -X PUT  repos/<user>/<name>/pages -F "https_enforced=true"
```

Every path in the app is relative and the manifest uses `"start_url": "./"`, so
it works from a subdirectory with no changes. `.nojekyll` is committed so Pages
serves the files as-is.

> **Do not skip the third command.** Pages does not enforce HTTPS by default, and
> without it two things break: service workers require a secure context, so
> offline and install both die silently, and an HTTP page can be modified in
> transit. For an app whose entire privacy model is "your writing never leaves
> the device", a script injected over plain HTTP could read localStorage and send
> it anywhere. Check with:
>
> ```sh
> gh api repos/<user>/<name>/pages --jq .https_enforced
> ```

**On any change to the shell**, bump `CACHE` in `sw.js`. Miss that and installed
copies keep serving the old version indefinitely.

If you fork and deploy it, change `SOURCE` at the top of `app.js` to point at
**your** repository. That is not politeness, it is the AGPL section 13
requirement below.

## License

**GNU Affero General Public License v3.0 or later.** Full text in `LICENSE`.

Chosen deliberately. AGPL is the copyleft that extends to hosted software: if you
modify this and run it as a website, section 13 obliges you to offer your users
the modified source. In practice that makes it very difficult to fork this into a
closed, paid product, which is exactly what it exists as an alternative to.

You are free to use, study, share and modify it. You are not free to take it
private.

## Credit and affiliation

Internal Family Systems was developed by **Richard Schwartz**, and the IFS
Institute trains and certifies practitioners in it.

**This project is not affiliated with, endorsed by, reviewed by, or certified by
the IFS Institute, Richard Schwartz, or any clinical body.** It is a practice aid
built from publicly described material by someone doing the work, not by a
clinician. It is not therapy, not a medical device, and not a crisis service.
