#! /usr/bin/env node
const fs = require('fs');
const lineReader = require('line-reader');

module.exports = function(gdiPath, workingDirectory) {
	lineReader.eachLine(gdiPath, (line) => {
		if (line.charAt(0) === '1') {
			const [,,,, binName] = line.split(' ');
			
			fs.open(`${workingDirectory}/${binName}`, 'r+', function (inputFileError, inputFd) {
				const buffer = Buffer.alloc(128);
		
				fs.read(inputFd, buffer, 0, 128, 0x90, (error, bytesRead, bufferRead) => {
					const outputNameFilePath = `${workingDirectory}/name.txt`;
					fs.writeFile(outputNameFilePath, bufferRead.toString().trim(), () =>
						console.log(`${outputNameFilePath} created`)
					);
				});
			});
		}
	});
	
};
