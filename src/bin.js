const path = require('path');
const fs = require('fs');
const gdiConversion = require('./convert');
const extractName = require('./name');
const getAllFiles = require('./getAllFiles');

const [ , , command, userPath] = process.argv;

if (userPath === undefined) {
	console.error('Error: cannot find path argument');
	return;
}

const absPath = path.resolve(process.cwd(), userPath);

fs.access(absPath, (err) => {
	if (err) {
		console.error(`Error: ${userPath} does not exist`);
		return;
	}

	switch (command.toLowerCase()) {
		case '-n':
			getAllFiles(absPath, '.gdi').forEach(extractName);			
			return;
		case '-c':
			getAllFiles(absPath, '.cue').forEach(gdiConversion);
			return;
		default:
			console.error(`Error: invalid parameter action: ${command}`);
			console.error('Use:')
			console.error('	-c		to convert .cue file to .gdi');
			console.error('	-n		to extract the game\'s name from the converted disc.gdi file');
	}
});
