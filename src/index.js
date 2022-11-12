import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { format } from "date-fns";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testDataDir = path.join(__dirname, "..", "test-data");

const movieFileExts = new Set([".mov", ".mp4"]);

async function main() {
  let files;
  try {
    files = await fs.readdir(testDataDir);
  } catch (err) {
    console.log("ERROR: Could not read files in directory");
    console.log(err);
  }

  for (const file of files) {
    if (!isMovieFile(file)) {
      continue;
    }

    console.log("INFO: Processing file", file);

    const jsonFileName = file + ".json";
    const jsonFilePath = path.join(testDataDir, jsonFileName);

    try {
      await fs.access(jsonFilePath);
    } catch (err) {
      console.log("ERROR:", jsonFileName, "does not exist. Skipping.");
      console.log(err);
      continue;
    }

    const metaDataFileContents = await fs.readFile(jsonFilePath, {
      encoding: "utf8",
    });

    let metadata;
    try {
      metadata = JSON.parse(metaDataFileContents);
    } catch (err) {
      console.log("ERROR:", jsonFileName, "is malformed JSON. Skipping.");
      console.log(err);
      continue;
    }

    const { args, nonExistantFields } = createArgs(metadata);
    for (const field of nonExistantFields) {
      console.log(
        "WARN:",
        field,
        "does not exist. Will not related EXIF data."
      );
    }

    const command = createCommand(args, path.join(testDataDir, file));
    console.log("INFO: Running", command);

    try {
      await execPromise(command);
    } catch (err) {
      console.log(`ERROR: Could not execute command "${command}"`);
      console.log(err);
    }
  }
}

function isMovieFile(fileName) {
  const ext = path.extname(fileName);
  return (
    movieFileExts.has(ext) ||
    movieFileExts.has(ext.toLowerCase()) ||
    movieFileExts.has(ext.toUpperCase())
  );
}

function createArgs(metadata) {
  const nonExistantFields = [];

  const timestamp = metadata.photoTakenTime?.timestamp;
  if (!timestamp) {
    nonExistantFields.push("photoTakenTime.timestamp");
  }
  const ms = timestamp * 1000;
  const formattedDate = format(ms, "yyyy:MM:dd kk:mm:ss");

  const formattedLatitude = metadata.geoDataExif?.latitude?.toFixed(3);
  if (!formattedLatitude) {
    nonExistantFields.push("photoTakenTime.timestamp");
  }

  const formattedLongitude = metadata.geoDataExif?.longitude?.toFixed(3);
  if (!formattedLongitude) {
    nonExistantFields.push("photoTakenTime.timestamp");
  }

  const formattedAltitude = metadata.geoDataExif?.altitude?.toFixed(3);
  if (!formattedAltitude) {
    nonExistantFields.push("photoTakenTime.timestamp");
  }

  return {
    args: {
      "Time:ModifyDate": formattedDate,
      "Time:DateTimeOriginal": formattedDate,
      "Time:CreateDate": formattedDate,
      "Time:GPSTimeStamp": formattedDate,
      "Time:GPSDateStamp": formattedDate,
      "Time:SubSecCreateDate": formattedDate,
      "Time:SubSecDateTimeOriginal": formattedDate,
      "Time:GPSDateTime": formattedDate,
      "Location:GPSLatitude": formattedLatitude,
      "Location:GPSLongitude": formattedLongitude,
      "Location:GPSAltitude": formattedAltitude,
    },
    nonExistantFields,
  };
}

function createCommand(args, filePath) {
  let command = "exiftool -overwrite_original";
  for (var key in args) {
    command += ` -${key}="${args[key]}"`;
  }
  command += ` ${filePath}`;
  return command;
}

function execPromise(command) {
  return new Promise((res, rej) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        rej(error);
        return;
      }

      if (stderr) {
        rej(stderr);
        return;
      }

      res(stdout);
    });
  });
}

main();
