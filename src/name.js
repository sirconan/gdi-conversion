#! /usr/bin/env node
const fs = require('fs');

module.exports = function(workingDirectory) {
	fs.open(`${workingDirectory}/track01.bin`, 'r+', function (inputFileError, inputFd) {
		const buffer = Buffer.alloc(128);

		fs.read(inputFd, buffer, 0, 128, 0x90, (error, bytesRead, bufferRead) => {
			const outputNameFilePath = `${workingDirectory}/name.txt`;
			fs.writeFile(outputNameFilePath, bufferRead.toString().trim(), () =>
				console.log(`${outputNameFilePath} created`)
			);
		});
	});
};
