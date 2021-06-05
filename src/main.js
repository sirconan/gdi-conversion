#! /usr/bin/env node
const parser = require('cue-parser');
const path = require('path')
const fs = require('fs');
const fsExtra = require('fs-extra');
const os = require('os');

const TRACK_TYPE_AUDIO = 'AUDIO';
const BLOCK_SIZE = 2352;
const OUTPUT_FOLDER = 'output';

module.exports = function(filePath) {
	const parseFile = (absPath) => {
		try {
			return parser.parse(absPath);
		} catch (errSheet) {
			console.error(`Cannot convert ${absPath}, only cue files are allowed`);
		}
	};

	const countIndexFrames= ({time}) => {
		let result = time.frame;
		result += (time.sec * 75);
		result += ((time.min * 60) * 75);
		return result;
	};

	const copyFileWithGapOffset = (inputFile, outputFile, size, frames) => {
		const position = frames * BLOCK_SIZE;
		
		const buffer = Buffer.alloc(size);

		fs.open(inputFile, 'r+', function (inputFileError, inputFd) {
			if (inputFileError) {
				throw inputFileError;
			}
		
			fs.open(outputFile, 'w+', function (outputFileError, outputFd) {
				if (outputFileError) {
					throw outputFileError;
				}
				
				fs.read(inputFd, buffer, 0, size, position, (error, bytesRead, bufferRead) => {
					if (error) {
						throw error;
					}
					
					fs.write(outputFd, bufferRead.slice(0, bytesRead), () => console.log(`${outputFile} created`));
				});
			});
		});

		return (size - position) / BLOCK_SIZE;
	};

	const padTrackNumber = (currentTrack) => {
		if (currentTrack < 10) {
			return `0${currentTrack}`;
		}

		return currentTrack;
	};

	const createSummaryFile = (gdiOutput) => {
		const outputGdiFilePath = `${workingDirectory}/${OUTPUT_FOLDER}/disc.gdi`;
		fs.writeFile(outputGdiFilePath, gdiOutput, () => console.log(`${outputGdiFilePath} created`));
	};

	const createTitleFile = () => {
		fs.open(`${workingDirectory}/${OUTPUT_FOLDER}/track01.bin`, 'r+', function (inputFileError, inputFd) {
			const buffer = Buffer.alloc(128);

			fs.read(inputFd, buffer, 0, 128, 0x90, (error, bytesRead, bufferRead) => {
				const outputNameFilePath = `${workingDirectory}/${OUTPUT_FOLDER}/name.txt`;
				fs.writeFile(outputNameFilePath, bufferRead.toString().trim(), () =>
					console.log(`${outputNameFilePath} created`)
				);
			});
		});
	};

	const absPath = path.resolve(process.cwd(), filePath);
	const workingDirectory = path.dirname(absPath);

	fs.access(absPath, (err) => {
		if (err) {
			console.error(`Error: ${filePath} does not exist`);
			return;
		}
		
		let currentSector = 0;
		fsExtra.emptyDirSync(`${workingDirectory}/${OUTPUT_FOLDER}`);

		const cueSheet = parseFile(absPath);
		if (!cueSheet) {
			return;
		}

		let gdiOutput = cueSheet.files.length + os.EOL;

		cueSheet.files.forEach((file, index, files) => {
			const currentTrack = file.tracks[0];

			const inputTrackFilePath = `${workingDirectory}/${file.name}`;
			const canPerformFullCopy = currentTrack.indexes.length == 1;
			
			const outputTrackFileName = `track${padTrackNumber(currentTrack.number)}.${currentTrack.type === TRACK_TYPE_AUDIO ? "raw" : "bin"}`
			
			const outputTrackFilePath = `${workingDirectory}/${OUTPUT_FOLDER}/${outputTrackFileName}`;
			const {size: inputTrackFileSize} = fs.statSync(inputTrackFilePath);
			let sectorAmount = 0;

			if (canPerformFullCopy) {
				fs.copyFile(inputTrackFilePath, outputTrackFilePath, () => console.log(`${outputTrackFilePath} created`));
				sectorAmount = inputTrackFileSize / BLOCK_SIZE;
			} else {
				const gapOffset = countIndexFrames(currentTrack.indexes[1]);
				sectorAmount = copyFileWithGapOffset(inputTrackFilePath, outputTrackFilePath, inputTrackFileSize, gapOffset);
				currentSector += gapOffset;
			}

			gdiOutput += `${index + 1} ${currentSector} ${currentTrack.type === TRACK_TYPE_AUDIO ? "0" : "4"} ${BLOCK_SIZE} ${outputTrackFileName} 0 ${os.EOL}`;
			
			currentSector += sectorAmount;

			if (cueSheet.rem[index] && cueSheet.rem[index].includes('HIGH-DENSITY AREA')) {
				if (currentSector < 45000) {
					currentSector = 45000;
				}
			}

			if (index === files.length - 1) {
				createSummaryFile(gdiOutput);
				createTitleFile();
			}
		});
	});
};
