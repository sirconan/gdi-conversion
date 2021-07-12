# gdi-conversion
gdi-conversion is a small Node.js program to convert Dreamcast Game Images (cue and bin files) to GDI Images in order to run on GDEmu. 

# Requirements
gdi-conversion tool has been developed on Linux with node 16.2.0 and npm 7.14. Three executables files have been built for Linux, Macos and Windows.

# How to use it for convert to GDI format?
- clone this repository
- run `npm install`
- run `node src/bin.js -c ./PATH_OF_THE_FILE_TO_CONVERT.cue` to convert CUE to GDI
- `output` folder is created in the source file folder and content gdi, bin and raw files, is ready for your GDEmu sdcard. `name.txt` file is created inside the `output` folder to store the game's name.

or 

- Download last release available
- `gdi-conversion-linux -c ./PATH_OF_THE_FILE_TO_CONVERT.cue` or `gdi-conversion-macos -c ./PATH_OF_THE_FILE_TO_CONVERT.cue` or `gdi-conversion-win.exe -c ./PATH_OF_THE_FILE_TO_CONVERT.cue` depending used operating system

# How to use it to extract game's name from disk.gdi file ?
- clone this repository
- run `npm install`
- run `node src/bin.js -n ./PATH_OF_THE_FILE/disc.gdi` to extract game's name
- `name.txt` file is created in the same folder to store the game's name. When you use `-c` command to convert, `-n` command is automatically running

or 

- Download last release available
- `gdi-conversion-linux -n ./PATH_OF_THE_FILE/disc.gdi` or `gdi-conversion-macos -n ./PATH_OF_THE_FILE/disc.gdi` or `gdi-conversion-win.exe -n ./PATH_OF_THE_FILE/disc.gdi` depending used operating system
