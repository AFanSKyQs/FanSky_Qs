import fs from "fs";

export function ChangePath(changePath) {
    return changePath.replace(/\\/g, "/");
}

export function isFileExist(isFilePath) {
    return new Promise((resolve, reject) => {
        isFilePath = ChangePath(isFilePath);
        fs.access(isFilePath, (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}