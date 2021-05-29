# gdi-conversion
gdi-conversion is a small Node.js program to convert Dreamcast Game Images (cue and bin files) to GDI Images in order to run on GDEmu.

# Needed Configuration
gdi-conversion tool has been developed and tested on Linux with node 16.2.0 and npm 7.14. 
# How to use it ?
- clone this repository
- run `npm install`
- run `node src/main.js PATH_OF_THE_FILE_TO_CONVERT.cue`
- `output` folder is created in the source file folder and content gdi, bin and raw files, is ready for your GDEmu sdcard
