import * as fs from "fs";

class item {
  player1 = "";
  player2 = "";
  occurences = 0;

  constructor(T, R) {
    this.player1 = T;
    this.player2 = R;
  }

  addOccurence() {
    this.occurences++;
    return this;
  }
}

function initTwoDArray(players) {
  let playersMap = new Map();
  for (let index = 0; index < players.length; index++) {
    let submap = new Map();
    for (let subindex = 0; subindex < players.length; subindex++) {
      submap.set(
        players[subindex].name,
        new item(players[index].name, players[subindex].name)
      );
    }
    playersMap.set(players[index].name, submap);
  }
  return playersMap;
}

function evaluatePoint(playersMap, points) {
  points.map((point) => {
    for (let index = 0; index < point.line.length; index++) {
      for (let subindex = 0; subindex < point.line.length; subindex++) {
        if (index !== subindex) {
          let cell = playersMap
            .get(point.line[index])
            .get(point.line[subindex])
            .addOccurence();
          playersMap.get(point.line[index]).set(point.line[subindex], cell);
        }
      }
    }
  });
}

function MapsToJson(playersMap) {
  return Array.from(playersMap.values()).flatMap((map) =>
    Array.from(map.values())
  );
}

const bucket = (x) => {
  x.occurences = Math.ceil(x.occurences / 10);
  return x;
};

function iterateFiles() {
  const dir = fs.opendirSync("./files");
  let dirent;
  let index = 0;
  let playersMap = null;
  while ((dirent = dir.readSync()) !== null) {
    let data = fs.readFileSync(`./files/${dirent.name}`);
    let parsed = JSON.parse(data);
    parsed.teamJson = JSON.parse(parsed.teamJson.replace("\\\\", ""));
    parsed.gameJson = JSON.parse(parsed.gameJson);
    parsed.gameJson.pointsJson = JSON.parse(parsed.gameJson.pointsJson);
    console.log(parsed.gameJson.pointsJson);
    if (index === 0) {
      playersMap = initTwoDArray(parsed.teamJson.players);
    }
    evaluatePoint(playersMap, parsed.gameJson.pointsJson);
    index++;
  }
  dir.closeSync();
  let json = MapsToJson(playersMap).map((x) => bucket(x));
  fs.writeFileSync("file.json", JSON.stringify(json));
}
iterateFiles();

// console.log(parsed.gameJson.pointsJson[3].events);
