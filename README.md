# Grounded Wiki Tools
Tools for editing the [Grounded Wiki](https://grounded.wiki.gg).

## Setup

Steps to run the project go here...

### The `data` folder

This folder exists as the start point for the rest of the scripts. To use it, you should set up a symlink to where you have extrated the JSON files from.

For example, I have the repo inside my Documents, and the extracted files in FModel's export folder inside my Downloads:

```ps1
cmd /c mklink /D "$HOME\Documents\Development\G2Wiki\data\Game" "$HOME\Downloads\FModel\Output\Exports\Augusta\Content"
```

`mklink` is a Command Prompt tool, I didn't dig to find what the PowerShell version was. This runs it as Command Prompt, with the `/D` flag meaning symbolic directory

The folder needs to be named "Game" and that should be linked to the "Content" folder from the data as that's how the namespace in the files works:
`/Game/Exported/Release_0_1/Localized/enus/Text/Text_enus`

### Running
Install [Node](https://nodejs.org/en/download) v24.21.0 (I like to use package managers like [Chocolatey](https://chocolatey.org/install)), then run:

```ps1
npm run [script-name]
# or, to debug without copying to clipboard
node .\[script-name].js
```

You can also use a tool like [ntl](https://github.com/ruyadorno/ntl) to select the scripts from the package in an interactive prompt.

#### Notes

Currently, there are two scripts:
* `brainpower-levels`
* `ranger-challenges`

These are just a proof of concept meant to see how viable this might be.

#### Brainpower Levels

Pulls the brainpower level data and formats it into a wiki table. This one seems to be accurate without any issues translating.

##### Ranger Challenges

It will pull the available quests and find all the data that needs the be entered into each row for the [wiki page](https://grounded.wiki.gg/wiki/Ranger_Challenges), as well as some helper utils that wrap things we might, like an item or creature, or automatically inserting the Raw Science template.

I have pasted the exact output into a [sandbox page](https://grounded.wiki.gg/wiki/User:User004/sandbox/Ranger_Challenges) to compare against, and here are some exceptions/notes:
* I haven't extracted 0.6 yet, so they don't match that, and there's some wrong data, but this data should be excatly what's in the export
  * Example: smoothie challenges (19, 44, 46)
* Some links are red (Orb Weaver Spiders, 21), are linked to a piece of armor instead of the whole set (clover, acorn, rusty, koi), or aren't linked (Zipline Anchors, 61)
  * My thought here is more helpers for more exceptions, I can check if they're armor, or maybe even if check the wiki itself if the page exists
* Numbers, again, are from the data exactly, but stylistically we don't appear to show a "(0/#)" if it's only one
  * We can make the decision for what the rules are and apply them across everything, hopefully allowing more consistency
* Nothing links to the G2 verison, if there is a tabber
  * Once again, more helpers/rules

**And most importantly**, this doesn't stop the manual work that still needs to be done getting files from the data or game, uploading them, and writing all the content that isn't copypasta. This project isn't meant to replace those things, just to assist.

Creating skeleton pages with the core bits of data, or lists like the prototype, will take time, but should be reusable every patch, and hopefully can free up time for the more intensive updates.

More to come...

* [https://grounded.wiki.gg/wiki/Special:ApiSandbox]
* [https://grounded.wiki.gg/api.php?action=help&modules=main]
