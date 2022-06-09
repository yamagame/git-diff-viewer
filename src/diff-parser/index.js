/**
 * react-diff-view より流用
 * https://github.com/otakustay/react-diff-view
 */

const STAT_START = 2;
// const STAT_FILE_META = 3;
const STAT_HUNK = 5;

export const parser = {
  parse: function (source) {
    var infos = [];
    var stat = STAT_START;
    var currentInfo;
    var currentHunk;
    var changeOldLine;
    var changeNewLine;

    var lines = source.split("\n");
    var linesLen = lines.length;
    var i = 0;

    while (i < linesLen) {
      var line = lines[i];

      if (line.indexOf("diff --git") === 0) {
        currentInfo = {
          hunks: [],
          oldEndingNewLine: true,
          newEndingNewLine: true,
        };

        infos.push(currentInfo);

        var currentInfoType = null;

        var simiLine;
        simiLoop: while ((simiLine = lines[++i])) {
          var spaceIndex = simiLine.indexOf(" ");
          var infoType = spaceIndex > -1 ? simiLine.slice(0, spaceIndex) : infoType;

          switch (infoType) {
            case "diff": // diff --git
              i--;
              break simiLoop;

            case "deleted":
            case "new":
              var leftStr = simiLine.slice(spaceIndex + 1);
              if (leftStr.indexOf("file mode") === 0) {
                currentInfo[infoType === "new" ? "newMode" : "oldMode"] = leftStr.slice(10);
              }
              break;

            case "similarity":
              currentInfo.similarity = parseInt(simiLine.split(" ")[2], 10);
              break;

            case "index":
              var segs = simiLine.slice(spaceIndex + 1).split(" ");
              var revs = segs[0].split("..");
              currentInfo.oldRevision = revs[0];
              currentInfo.newRevision = revs[1];

              if (segs[1]) {
                currentInfo.oldMode = currentInfo.newMode = segs[1];
              }
              break;

            case "copy":
            case "rename":
              var infoStr = simiLine.slice(spaceIndex + 1);
              if (infoStr.indexOf("from") === 0) {
                currentInfo.oldPath = infoStr.slice(5);
              } else {
                currentInfo.newPath = infoStr.slice(3);
              }
              currentInfoType = infoType;
              break;

            case "---":
              var oldPath = simiLine.slice(spaceIndex + 1);
              var newPath = lines[++i].slice(4);
              if (oldPath === "/dev/null") {
                newPath = newPath.slice(2);
                currentInfoType = "add";
              } else if (newPath === "/dev/null") {
                oldPath = oldPath.slice(2);
                currentInfoType = "delete";
              } else {
                currentInfoType = "modify";
                oldPath = oldPath.slice(2);
                newPath = newPath.slice(2);
              }

              currentInfo.oldPath = oldPath;
              currentInfo.newPath = newPath;
              stat = STAT_HUNK;
              break simiLoop;

            default:
              break;
          }
        }

        currentInfo.type = currentInfoType || "modify";
      } else if (line.indexOf("Binary") === 0) {
        currentInfo.isBinary = true;
        currentInfo.type =
          line.indexOf("/dev/null and") >= 0
            ? "add"
            : line.indexOf("and /dev/null") >= 0
            ? "delete"
            : "modify";
        stat = STAT_START;
        currentInfo = null;
      } else if (stat === STAT_HUNK) {
        if (line.indexOf("@@") === 0) {
          var match = /^@@\s+-([0-9]+)(,([0-9]+))?\s+\+([0-9]+)(,([0-9]+))?/.exec(line);
          currentHunk = {
            content: line,
            oldStart: match[1] - 0,
            newStart: match[4] - 0,
            oldLines: match[3] - 0 || 1,
            newLines: match[6] - 0 || 1,
            changes: [],
          };

          currentInfo.hunks.push(currentHunk);
          changeOldLine = currentHunk.oldStart;
          changeNewLine = currentHunk.newStart;
        } else {
          var typeChar = line.slice(0, 1);
          var change = {
            content: line.slice(1),
          };

          switch (typeChar) {
            case "+":
              change.type = "insert";
              change.isInsert = true;
              change.lineNumber = changeNewLine;
              changeNewLine++;
              break;

            case "-":
              change.type = "delete";
              change.isDelete = true;
              change.lineNumber = changeOldLine;
              changeOldLine++;
              break;

            case " ":
              change.type = "normal";
              change.isNormal = true;
              change.oldLineNumber = changeOldLine;
              change.newLineNumber = changeNewLine;
              changeOldLine++;
              changeNewLine++;
              break;

            case "\\":
              var lastChange = currentHunk.changes[currentHunk.changes.length - 1];
              if (!lastChange.isDelete) {
                currentInfo.newEndingNewLine = false;
              }
              if (!lastChange.isInsert) {
                currentInfo.oldEndingNewLine = false;
              }
              break;

            default:
              break;
          }

          change.type && currentHunk.changes.push(change);
        }
      }

      i++;
    }

    return infos;
  },
};
