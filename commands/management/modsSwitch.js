const plugins = require("../../resources/plugins.js");
module.exports = {
    name:plugins.modeSwitcher.plug,
    description:plugins.modeSwitcher.desc,
    async execute(sock,msg,args){
     const { texts } = require("../../resources/package.js");
            const contextInfo = require("../../resources/costumase.js");
            const settings =require("../../resources/settings.js");
            const modeSwitcher = require("../../functions/switchFunction.js")
     const [params]=args;
     await modeSwitcher(params,sock,msg);
    }
}