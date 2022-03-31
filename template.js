import path from 'path';
import exceljs from 'exceljs';
import moment from 'moment';

import { Log } from './log.js';

class Template {

    static OUTPUT_DIR = 'output/';
    
    constructor() {
        this.workbook = new exceljs.Workbook();
    }

    async loadSeasonWorksheet() {
        const templatePath = path.resolve('template/output_seasons.xlsx');
        Log.info(`loading template: [${templatePath}]`);
        await this.workbook.xlsx.readFile(templatePath);
        this.worksheet = this.workbook.worksheets[0];
    }
    
    fillSeasonWorksheet(animes) {
        for (let index = 0; index < animes.length; index++) {
            const anime = animes[index];
            this.worksheet.addRow([
                anime.id,
                anime.title,
                anime.mediaType,
                anime.seasonYear,
                anime.season
            ], { heigth: 22.50 });
        }
    }

    async saveSeasonWorksheet() {
        let datepart = moment(new Date()).format('YYYYMMDD_HHmmss');
        let destinationPath = `${path.resolve(Template.OUTPUT_DIR)}${path.sep}seasons_${datepart}.xlsx`;
        
        Log.info(`saving season output: [${destinationPath}]`);
        
        await this.workbook.xlsx.writeFile(destinationPath);
    }
}

export { Template };