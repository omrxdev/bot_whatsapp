const fs = require(`fs`);
const paths = require(`../resources/paths`);
async function updateKickedCount(Number) {
  try {
    let kickedCount = 0;

    try {
      const data = await fs.promises.readFile(paths.kickStatics, "utf8");
      const parsedData = JSON.parse(data);
      kickedCount = parsedData.CountOfKicked || 0;
    } catch (error) {
      console.error(error);
    }
    kickedCount += Number;
    const updatedData = {
      CountOfKicked: kickedCount,
    };
    await fs.promises.writeFile(
      paths.kickStatics,
      JSON.stringify(updatedData, null, 2)
    );
  } catch (error) {
    console.error(error);
  }
}
module.exports = updateKickedCount;
