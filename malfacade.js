import fs from 'fs';
import axios from 'axios';
import { Log } from './log.js';

class MALFacade {

    static getAuth() {
        return JSON.parse(fs.readFileSync('auth/malsearcher.json'));
    }

    static async getSeasonalAnime(seasons) {
        
        let animes = [];

        for (let index = 0; index < seasons.length; index++) {
            
            const season = seasons[index];

            Log.info(`searching anime information for: [${season.year}, ${season.season}]`);

            let auth = MALFacade.getAuth();
            let authHeader = JSON.parse(`{ "${auth.header}" : "${auth.value}" }`);

            let offset = 0;
            let limit = 100;
            let lastPage = false;

            let baseURI = `https://api.myanimelist.net/v2/anime/season/${season.year}/${season.season}`;

            while (!lastPage) {
                
                let configParams = {
                    offset : offset,
                    limit: limit,
                    nsfw: true,
                    fields: 'id,title,media_type,opening_themes,ending_themes'
                };

                try {
                    
                    let response = await axios.get(baseURI, { headers: authHeader, params: configParams });
                    
                    if (response.status === 200) {

                        let data = [...response.data.data];

                        for (let index = 0; index < data.length; index++) {
                            const currentData = data[index].node;
                            
                            let anime = {
                                id : currentData.id,
                                title : currentData.title,
                                mediaType : currentData.media_type,
                                seasonYear: season.year,
                                season: season.season
                            }

                            switch (anime.mediaType.toUpperCase()) {
                                case 'TV':
                                case 'OVA':
                                case 'MOVIE':
                                case 'SPECIAL':
                                case 'ONA':
                                    animes.push(anime);
                                    break;
                            
                                default:
                                    break;
                            }
                        }

                        let paging = response.data;

                        if (paging.next != undefined) {
                            offset += limit;
                        } else {
                            lastPage = true;
                        }
                    }
                } catch (error) {
                    if (error.response) {
                        if (error.response.status === 404) {
                            Log.warn(`anime season not found for: [${season.year}, ${season.season}]`);
                        }
                    } else {
                        Log.error(`error while searching anime information for: [${season.year}, ${season.season}]`);
                        Log.fatal(error);
                    }
                    lastPage = true;
                }
            }
        }

        return animes;
    }

    static async getAnimeDetails(ids) {

        let animes = [];

        for (let index = 0; index < ids.length; index++) {
            
            const id = ids[index];

            Log.info(`searching anime details for: [${id}] [${Math.round(100 * index / ids.length).toFixed(2)} % done]`);

            let auth = MALFacade.getAuth();
            let authHeader = JSON.parse(`{ "${auth.header}" : "${auth.value}" }`);

            let offset = 0;
            let limit = 100;

            let baseURI = `https://api.myanimelist.net/v2/anime/${id}`;

            let configParams = {
                offset : offset,
                limit: limit,
                nsfw: true,
                fields: 'id,title,media_type,opening_themes,ending_themes'
            };

            try {

                let response = await axios.get(baseURI, { headers: authHeader, params: configParams });

                if (response.status === 200) {

                    let data = response.data;
                    
                    let anime = {
                        id : data.id,
                        title : data.title,
                        mediaType : data.media_type,
                        openings: MALFacade.getAnimeThemes(data.opening_themes),
                        endings: MALFacade.getAnimeThemes(data.ending_themes),
                    }

                    if (anime.openings.length + anime.endings.length === 0) {
                        Log.warn(`no themes were found for: [${id}]`)
                    }

                    switch (anime.mediaType.toUpperCase()) {
                        case 'TV':
                        case 'OVA':
                        case 'MOVIE':
                        case 'SPECIAL':
                        case 'ONA':
                            animes.push(anime);
                            break;
                    
                        default:
                            break;
                    }
                }
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 404) {
                        Log.warn(`anime details not found for: [${id}]`);
                    }
                } else {
                    Log.error(`error while searching anime details for: [${id}]`);
                    Log.fatal(error);
                }
            }

            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });
        }

        return animes;
    }

    static getAnimeThemes(entries) {
        if (entries === undefined) {
            return [];
        }
        const regex = /^((#*([0-9]*):*)(.+))( by )([^(\n]+)(\([\S ]+\).?)*$/;
        let songs = [];
        for (let index = 0; index < entries.length; index++) {
            const current = entries[index];
            const match = regex.exec(current.text.trim());
            if (match) {
                const song = {
                    id : MALFacade.getThemeId(match[3]),
                    title : MALFacade.getThemeTitle(match[4].trim()),
                    artist : MALFacade.getThemeArtist(match[6].trim()),
                };
                songs.push(song);
                Log.debug(JSON.stringify(song));
            } else {
                Log.warn(`no match: [${current.text.trim()}]`);
                const song = {
                    id : 'ERR',
                    title : current.text.trim(),
                    artist : '',
                };
                songs.push(song);
            }
        }
        return songs;
    }

    static getThemeId(id) {
        if (id === '') {
            return '1';
        }
        return id;
    }

    static getThemeTitle(title) {
        if (title[0] === '\"') {
            title = title.substr(1, title.length - 1);
        }
        if (title[title.length - 1] === '\"') {
            title = title.substr(0, title.length -1);
        }
        return title;
    }

    static getThemeArtist(artist) {
        return artist;
    }
}

export { MALFacade };