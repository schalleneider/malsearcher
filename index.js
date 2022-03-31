import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Log } from './log.js';
import { Template } from './template.js';
import { MALFacade } from './malfacade.js';

// initialize the yargs parameters
const argv = yargs(hideBin(process.argv)).argv;

main();

async function main() {

    switch (argv.mode.toUpperCase()) {
        case 'SEASONS':
            await mainSeasons();
            break;
        
        case 'DETAILS':
            await mainIds();
            break;
    
        default:
            Log.error(`invalid mode: [${mode}]. Available modes: [seasons, ids].`);
    }

    Log.info('done...');
}

async function mainSeasons() {
    Log.info(`loading season config: [${argv.seasons}]`);

    const seasons = JSON.parse(fs.readFileSync(argv.seasons));
    let animes = await MALFacade.getSeasonalAnime(seasons);

    const template = new Template();
    await template.loadSeasonWorksheet();
    template.fillSeasonWorksheet(animes);
    await template.saveSeasonWorksheet();
}

async function mainIds() {
    Log.info(`loading ids config: [${argv.ids}]`);

    const ids = JSON.parse(fs.readFileSync(argv.ids));
    let animes = await MALFacade.getAnimeDetails(ids);

}

