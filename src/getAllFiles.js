const path = require('path');
const fs = require('fs');

const getAllFiles = (dirPath, arrayOfFiles, ext) => {
	files = fs.readdirSync(dirPath)
	
	arrayOfFiles = arrayOfFiles || []
	
	files.forEach(function(file) {
		const currentElement = fs.statSync(dirPath + "/" + file);
		if (currentElement.isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles, ext)
		} else if (currentElement.isFile() && file.substr(file.length - 4) === ext) {
			arrayOfFiles.push(path.join(dirPath, "/", file))
		}
	})

	return arrayOfFiles
};

module.exports = function(dirPath, ext) {
	const state = fs.lstatSync(dirPath);
	const fileList = state.isDirectory() ? getAllFiles(dirPath, [], ext) : [dirPath];
	
	if (fileList.length === 0) {
		console.error(`Error: cannot find '${ext}' files in '${dirPath}' folder`);
	}

	return fileList;
};