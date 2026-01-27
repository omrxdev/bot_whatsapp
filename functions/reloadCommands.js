const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

function setupGlobalHotReload(
  commandsMap,
  folders = {
    commands: path.join(__dirname, "../commands"),
    sessionCommands: path.join(__dirname, "../sessionsCommands"),
  }
) {
  const watchAndReload = (folderPath, map, label) => {
    fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
      if (filename.endsWith(".js")) {
        const fullPath = path.join(folderPath, filename);
        try {
          delete require.cache[require.resolve(fullPath)];
          const updatedCommand = require(fullPath);

          if (
            updatedCommand?.name &&
            typeof updatedCommand.execute === "function"
          ) {
            map.set(updatedCommand.name, updatedCommand);
            console.log(
              chalk.green(
                `[HotReload] 🔁 Reloaded ${label}: ${updatedCommand.name}`
              )
            );
          } else {
            console.log(
              chalk.yellow(`[HotReload] ⚠️ Invalid format in ${filename}`)
            );
          }
        } catch (err) {
          console.error(
            chalk.red(
              `[HotReload] ❌ Failed to reload ${filename}: ${err.message}`
            )
          );
        }
      }
    });

    console.log(chalk.cyan(`[HotReload] Watching ${label} for changes...`));
  };

  watchAndReload(folders.commands, commandsMap, "commands");
  watchAndReload(folders.sessionCommands, commandsMap, "sessionCommands");
}

module.exports = { setupGlobalHotReload };
