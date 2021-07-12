const path = require('path');
const fs = require('fs');
const gdiConversion = require('./convert');
const extractName = require('./name');

const [ , , command, filePath] = process.argv;

const absPath = path.resolve(process.cwd(), filePath);

fs.access(absPath, (err) => {
	if (err) {
		console.error(`Error: ${filePath} does not exist`);
		return;
	}
	
	const workingDirectory = path.dirname(absPath);

	switch (command) {
		case '-n':
			extractName(absPath, workingDirectory);
			return;
		case '-c':
			gdiConversion(absPath, workingDirectory);
			return;
		default:
			console.log(`invalid parameter action: ${command}`);
			console.log('-c		to convert .cue file to .gdi');
			console.log('-n		to extract the game\'s name from the converted disc.gdi file');
	}
});
