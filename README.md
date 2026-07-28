# Unblended

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
- Irritated, frightened, or "I want it gone" means a **second part** has arrived
  and is now driving.

In the second case the app does not push you forward. It turns you toward the new
part and gives you the ask: *would you give me a little room, I am not going to
let it take over*. Then it re-asks. That loop is unblending, and everything else
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

## Credit

Internal Family Systems was developed by **Richard Schwartz**. This is a practice
aid, built by someone doing the work, not by a clinician.
