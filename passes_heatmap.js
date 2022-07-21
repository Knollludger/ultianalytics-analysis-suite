import * as fs from "fs";

class item {
  thrower = "";
  receiver = "";
  occurences = 0;

  constructor(T, R) {
    this.thrower = T;
    this.receiver = R;
  }

  addThrow() {
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

function evaluateAction(playersMap, event) {
  if (
    (event.action === "Goal" || event.action === "Catch") &&
    event.type === "Offense"
  ) {
    let cell = playersMap.get(event.passer).get(event.receiver).addThrow();
    playersMap.get(event.passer).set(event.receiver, cell);
  }
}

function evaluatePoints(playersMap, points) {
  points.map((point) => {
    point.events.map((action) => evaluateAction(playersMap, action));
  });
}

function MapsToJson(playersMap) {
  return Array.from(playersMap.values()).flatMap((map) =>
    Array.from(map.values())
  );
  // .filter((x) => {
  //   return !["Josh", "Cherie", "Terry", "Maria", "Craig"].includes(x.thrower);
  // })
  // .filter((x) => {
  //   return !["Josh", "Cherie", "Terry", "Maria", "Craig"].includes(
  //     x.receiver
  //   );
  // });
}

function bucketize(arr) {
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  let uniqueVals = arr
    .map((entry) => entry.occurences)
    .filter(onlyUnique)
    .sort((x, y) => x - y);
  console.log(uniqueVals);
}

const bucket = (x) => {
  x.occurences = Math.ceil(x.occurences / 4);
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
    if (index === 0) {
      playersMap = initTwoDArray(parsed.teamJson.players);
    }
    evaluatePoints(playersMap, parsed.gameJson.pointsJson);
    index++;
  }
  dir.closeSync();
  let json = MapsToJson(playersMap).map((x) => bucket(x));
  fs.writeFileSync("file.json", JSON.stringify(json));
}

iterateFiles();

// console.log(parsed.gameJson.pointsJson[3].events);
