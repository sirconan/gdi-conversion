const path = require('path');
const parser = require('cue-parser');
const fs = require('fs');
const fsExtra = require('fs-extra');
const os = require('os');
const extractName = require('./name');

const TRACK_TYPE_AUDIO = 'AUDIO';
const BLOCK_SIZE = 2352;
const OUTPUT_FOLDER = 'output';


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
				
				fs.write(outputFd, bufferRead.slice(0, bytesRead), () => void 0);
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

// this new function surely look rather arcane, though it was the more precise, 
// fool-proof way to rename .gdi files by striping out any extra text 
// inside ()[]{} (and these special characters themselves, along with others),
// also trimming any extra spaces and replacing special chars
// and spaces between words with _ that might restrain chdman
// or any chain/batch operations to do its job.
// This might be especially true when running scripts on PowerShell
// or UNIX shell that might interpret these encapsulations as
// functions or background shells, thus breaking the strings and
// failing the compression operation

const gdiFilenameParser = (filename) => {
  const hasDisc = filename.match(/disc\s\d/gi);
  const disc = hasDisc === null ? "" : hasDisc.toString();
  const gdiname = `${filename.replace(/[\s]?[\[\(\{]([\s]?[\w]+.?[\w]+[\s]?)+?[\]\)\}][\s]?/g,'')} ${disc}`;
  return `${gdiname.replace(/([^.^\d^\w])/g, '_')}.gdi`;
};

const createSummaryFile = (workingDirectory, gdiOutput, absPath) => {
  const filename = path.basename(absPath,'.cue');
 	const outputGdiFilePath = `${workingDirectory}/${OUTPUT_FOLDER}/${gdiFilenameParser(filename)}`;
	fs.writeFile(outputGdiFilePath, gdiOutput, () => void 0);
};

module.exports = function(absPath) {
	const workingDirectory = path.dirname(absPath);

	let currentSector = 0;
	//fsExtra.emptyDirSync(`${workingDirectory}/${OUTPUT_FOLDER}`);

	const cueSheet = parseFile(absPath);
	if (!cueSheet) {
		return;
	}

	let gdiOutput = cueSheet.files.length + os.EOL;

	cueSheet.files.forEach((file, index, files) => {
		const currentTrack = file.tracks[0];

		const inputTrackFilePath = `${workingDirectory}/${file.name}`;
		const canPerformFullCopy = currentTrack.indexes.length == 1;
		
		const outputTrackFileName = `${file.name.substring(0,file.name.indexOf("."))} track${padTrackNumber(currentTrack.number)}.${currentTrack.type === TRACK_TYPE_AUDIO ? "raw" : "bin"}`;
		
		const outputTrackFilePath = `${workingDirectory}/${OUTPUT_FOLDER}/${outputTrackFileName}`;
		const {size: inputTrackFileSize} = fs.statSync(inputTrackFilePath);
		let sectorAmount = 0;

		if (canPerformFullCopy) {
			fs.copyFile(inputTrackFilePath, outputTrackFilePath, () => void 0);
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
			createSummaryFile(workingDirectory, gdiOutput, absPath);
			extractName(`${workingDirectory}/${OUTPUT_FOLDER}/`);
		}
	});
};
