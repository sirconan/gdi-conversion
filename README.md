# gdi-conversion

gdi-conversion is a small Node.js program to convert Dreamcast Game Images (cue and bin files) to GDI Images in order to run on GDEmu or further compression to CHD (as CHD files fails to run if compressed directly from bin/cue files).

# Requirements

gdi-conversion tool has been developed on Linux with node 18.16.1 and npm 9.7.2. Three executables files have been built for Linux, Macos and Windows.

# How to use it

- clone  repository
- run `npm install`
- run `node src/bin.js [option] <input>`

or

- Download last release available and depending used operating system run :

 ```
gdi-conversion-linux [option] <input> 
gdi-conversion-macos [option] <input>
gdi-conversion-win.exe [option] <input>
``` 

# Parameters 

- [option]: 
	- `-c` to convert cue to gdi
	- `-n` to extract game's name from gdi file

- \<input\>: gdi or cue file path or folder path for mass file conversion

# Output
An `output` folder will be create next to `.cue` file containing conversion result

A `name.txt` file will be created next to `.gdi` file containing the game's name 

# Examples
```
gdi-conversion-linux -c ./MyUser/
``` 
to convert recursively all .cue files in MyUser folder on linux

```
gdi-conversion-win.exe -n ./Download/Game/[insert_your_disc_name].gdi
```
 to convert only Game/[insert_your_disc_name].gdi file on windows
