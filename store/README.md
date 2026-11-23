# Chrome Web Store listing

Everything the store listing uses, in 11 languages, and the scripts that made it.
None of this ships in the extension package: it is uploaded by hand in the
[developer dashboard](https://chrome.google.com/webstore/devconsole) (Store listing).

Languages: `en` (default) `de` `fr` `id` `it` `ja` `pt_BR` `ro` `tr` `uk` `zh_CN`.

## What goes where in the dashboard

| Dashboard field | File |
|---|---|
| Description | `listing/<lang>/description.txt` |
| Screenshots (1280×800, up to 5) | `images/<lang>/1-…jpg` to `5-…jpg`, in number order |
| Small promo tile (440×280) | `images/<lang>/small-promo-440x280.jpg` |
| Marquee promo tile (1400×560) | `images/<lang>/marquee-1400x560.jpg` |
| Promo video | YouTube link below |

English goes in the *Global* fields. For every other language, pick it in the
language menu at the top of the page and fill the *Localized* fields.

The one-line summary under the extension name is not set here: it is
`extDescription` in `src/_locales/<lang>/messages.json` and ships with a release.

## Promo videos (YouTube, ZeroWP channel)

Title and description for each upload: `listing/<lang>/youtube.txt`.
Thumbnail: `images/<lang>/1-formats-itself.jpg`.

| Language | Video |
|---|---|
| en (global) | https://www.youtube.com/watch?v=n6z5o0HBGKQ |
| de | https://www.youtube.com/watch?v=AJFAhVm0C9E |
| fr | https://www.youtube.com/watch?v=Tk5iObgR1v0 |
| id | https://www.youtube.com/watch?v=2Is1E7XG7u8 |
| it | https://www.youtube.com/watch?v=5DRUVucfJJ8 |
| ja | https://www.youtube.com/watch?v=15DpMvZIxF0 |
| pt_BR | https://www.youtube.com/watch?v=PfcgJO9GD4k |
| ro | https://www.youtube.com/watch?v=9bI025jQv6Q |
| tr | https://www.youtube.com/watch?v=c7mWrEzjDt4 |
| uk | https://www.youtube.com/watch?v=c2e_hQWLTCU |
| zh_CN | https://www.youtube.com/watch?v=YQaqZx40KtU |

The GitHub README shows `images/readme-video.jpg` (the English thumbnail with a play
button) linked to the English video. Rebuild it with `node store/tools/images/readme-thumb.mjs`
run from `store/tools/images`.

## YouTube Shorts (vertical 1080×1920)

Same narration, music and captions as the promo videos, recorded in a phone-shaped window.
Title and description: `listing/<lang>/youtube-short.txt`. Each Short has a pinned first
comment with the store link in its language.

| Language | Short |
|---|---|
| en | https://youtube.com/shorts/MVkOXXmuFME |
| de | https://youtube.com/shorts/9TFqwD8x8n8 |
| fr | https://youtube.com/shorts/xWtfqkvaiMA |
| id | https://youtube.com/shorts/An80EiW9rh0 |
| it | https://youtube.com/shorts/T3OysPhsP_w |
| ja | https://youtube.com/shorts/i1dl0HYSMTY |
| pt_BR | https://youtube.com/shorts/kPbLjH_v19Q |
| ro | https://youtube.com/shorts/eOv1D49kLM4 |
| tr | https://youtube.com/shorts/yy3NdDteSNk |
| uk | https://youtube.com/shorts/mzFHbKgdUWI |
| zh_CN | https://youtube.com/shorts/prjkqsniljg |

## Rebuilding the assets

The images and videos are made from the real extension, so rebuild them when
the UI changes. Both tools drive Chrome with Puppeteer and need a build of the
extension in `src/` (`npm run production`). macOS only: the UI language is
switched with Chrome's `-AppleLanguages` flag.

```bash
npm run production
npm install --no-save puppeteer     # only needed for these tools
```

### Screenshots and promo tiles

```bash
cd store/tools/images
for l in en de fr id it ja pt_BR ro tr uk zh_CN; do
  node capture.mjs $l                     # screenshots of the extension in that language -> shots/<lang>/
  node render.mjs ../../images/$l $l      # composes the 7 store images
done
node sheet.mjs 2-fold-and-path            # optional: contact sheet to check one image in all languages
```

- Image text: `strings.json`. Layout: `slides.html`. Headlines shrink to fit long translations.
- Hidden in every capture: the sponsor link (not part of the functionality).

### Promo videos

```bash
cd store/tools/video
for l in en de fr id it ja pt_BR ro tr uk zh_CN; do
  node record.mjs $l          # records the scenes with the extension in that language -> scenes/<lang>/
  node compose-l10n.mjs $l    # adds voice, music and captions -> out/<lang>/code-formatter-promo.mp4
done
```

For the vertical Shorts version, prefix both commands with `SHORT=1`
(output in `out-short/<lang>/`).

Needs `ffmpeg` with libass (for captions). Narration lines, title/end card text and
captions: `i18n.json`.

**Audio** (`store/audio/`): ElevenLabs, made through the ElevenLabs MCP connector,
kept here so the videos rebuild without spending credits.

- `music/music.mp3`: instrumental bed (eleven_music_v2_5). Mixed at −21 dB and ducked under the voice.
- `<lang>/00.mp3`–`09.mp3`: the 10 narration lines (eleven_v4), in the order of `i18n.json` `vo`.

If a line in `i18n.json` changes, regenerate only that mp3 with the same voice:

| Language | ElevenLabs voice (voice_id) |
|---|---|
| en | Miles – Clear Explainer Narrator (`wL5XZMjDi4k4GNoG3ZFW`) |
| de | Andreas – E-Learning (`D7Kc8UwHvMOzEuzczitH`) |
| fr | Romain – E-learning & Documentary (`18NUO6C3U1qa5bYQCTq3`) |
| id | Reyy – Friendly, Calm Indonesian (`wMKUNhmaI6q0edIyjs4l`) |
| it | Marcello F.V. Documentaries (`6yL63QX1UYDHukHejoIF`) |
| ja | Toshimasa Hashimoto – Clear Narrator (`vs2PGwcYSFgxPMl1rIa1`) |
| pt_BR | João Granzotto (`c5MoNKd5vIxHik2KlDgd`) |
| ro | Riko – Premium Romanian Voice (`rRunheiU4RPEcNcKdfpD`) |
| tr | Eyüp Koçak (`oxvtrCFcYC5QGvKjXxuA`) |
| uk | Dmytro – confident Ukrainian narrator (`s9vT9GRNlmMTTVkNHBN4`) |
| zh_CN | Ming – professional (`BBHoHpGBAZTswB4lLbUH`) |
