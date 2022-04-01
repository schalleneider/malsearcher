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
    
    async loadDetailsWorksheet() {
        const templatePath = path.resolve('template/output_details.xlsx');
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

    fillDetailsWorksheet(animes) {
        for (let animeIndex = 0; animeIndex < animes.length; animeIndex++) {
            const anime = animes[animeIndex];
            for (let openingIndex = 0; openingIndex < anime.openings.length; openingIndex++) {
                const opening = anime.openings[openingIndex];
                this.worksheet.addRow([
                    anime.id,
                    anime.title,
                    anime.mediaType,
                    opening.artist,
                    opening.title,
                    'OP ' + opening.id
                ], { heigth: 22.50 });
            }
            for (let endingIndex = 0; endingIndex < anime.endings.length; endingIndex++) {
                const ending = anime.endings[endingIndex];
                this.worksheet.addRow([
                    anime.id,
                    anime.title,
                    anime.mediaType,
                    ending.artist,
                    ending.title,
                    'ED ' + ending.id
                ], { heigth: 22.50 });
            }
        }
    }

    async saveSeasonWorksheet() {
        let datepart = moment(new Date()).format('YYYYMMDD_HHmmss');
        let destinationPath = `${path.resolve(Template.OUTPUT_DIR)}${path.sep}seasons_${datepart}.xlsx`;
        
        Log.info(`saving season output: [${destinationPath}]`);
        
        await this.workbook.xlsx.writeFile(destinationPath);
    }

    async saveDetailsWorksheet() {
        let datepart = moment(new Date()).format('YYYYMMDD_HHmmss');
        let destinationPath = `${path.resolve(Template.OUTPUT_DIR)}${path.sep}details_${datepart}.xlsx`;
        
        Log.info(`saving details output: [${destinationPath}]`);
        
        await this.workbook.xlsx.writeFile(destinationPath);
    }
}

export { Template };