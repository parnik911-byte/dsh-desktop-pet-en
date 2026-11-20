NOTICE

dsh-desktop-pet uses and reuses the following third-party work:

- Pet sprite art (assets/characters/whale-girl/*.png) and animation sheets
  (assets/characters/whale-girl/manifest.json) come from
  https://github.com/vlln/whale-girl — that plugin is released under the MIT License.
  - The character design (Whale Girl / whale-girl) is by ZipZipPipe.
  - The full LICENSE of the whale-girl project is kept with the assets in its
    upstream repository.
- The desktop runtime uses Electron (MIT License, https://electronjs.org).
- The Codex pet format (pet.json + spritesheet) is an adapter implemented by this
  project and contains no third-party code; characters loaded through it (such as
  pets installed via petdex) retain their own authors' copyrights — please confirm
  the license before redistributing. Characters added at runtime live in the user
  directory `%APPDATA%/dsh-desktop-pet/characters/` and are not part of this package.

The remainder of this project (index.mjs / config.mjs / main.js / preload.js / renderer/*)
is original work, MIT License.
