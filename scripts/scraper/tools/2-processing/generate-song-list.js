/**
 * Generate Song List Report
 *
 * Creates a text file listing all scraped songs organized by artist.
 *
 * Usage:
 *   node generate-song-list.js
 */

const fs = require('fs');
const path = require('path');

class SongListGenerator {
  constructor() {
    this.imagesDir = path.join(__dirname, '../../output/espirituguitarrista-catalog/images');
    this.outputFile = path.join(__dirname, '../../output/espirituguitarrista-catalog/songs-list.txt');
  }

  /**
   * Read all artists and their songs from the images folder
   */
  readSongsByArtist() {
    const songsByArtist = {};

    if (!fs.existsSync(this.imagesDir)) {
      throw new Error(`Directory not found: ${this.imagesDir}`);
    }

    // Read artist folders
    const artists = fs.readdirSync(this.imagesDir);

    for (const artist of artists) {
      const artistPath = path.join(this.imagesDir, artist);
      if (!fs.statSync(artistPath).isDirectory()) continue;

      // Read song folders
      const songs = fs.readdirSync(artistPath);
      const songList = [];

      for (const song of songs) {
        const songPath = path.join(artistPath, song);
        if (!fs.statSync(songPath).isDirectory()) continue;

        // Format song name (from slug to readable)
        const songName = song.split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        songList.push(songName);
      }

      // Format artist name
      const artistName = artist.split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      songsByArtist[artistName] = songList.sort();
    }

    return songsByArtist;
  }

  /**
   * Generate formatted text report
   */
  generateReport(songsByArtist) {
    let report = '';

    report += '═'.repeat(70) + '\n';
    report += '  ESPÍRITU GUITARRISTA - CANCIONES EXTRAÍDAS\n';
    report += '═'.repeat(70) + '\n\n';

    const artists = Object.keys(songsByArtist).sort();
    let totalSongs = 0;

    for (const artist of artists) {
      const songs = songsByArtist[artist];
      totalSongs += songs.length;

      report += `${artist.toUpperCase()} (${songs.length} canciones)\n`;
      report += '─'.repeat(70) + '\n';

      songs.forEach((song, idx) => {
        report += `  ${(idx + 1).toString().padStart(3, ' ')}. ${song}\n`;
      });

      report += '\n';
    }

    report += '═'.repeat(70) + '\n';
    report += `TOTAL: ${totalSongs} canciones de ${artists.length} artistas\n`;
    report += '═'.repeat(70) + '\n';

    return report;
  }

  /**
   * Run the generator
   */
  run() {
    console.log('📊 Generando listado de canciones...\n');

    try {
      const songsByArtist = this.readSongsByArtist();
      const report = this.generateReport(songsByArtist);

      fs.writeFileSync(this.outputFile, report, 'utf8');

      console.log('✅ Listado generado exitosamente\n');
      console.log(`📁 Archivo: ${this.outputFile}\n`);

      // Show summary
      const artists = Object.keys(songsByArtist);
      const totalSongs = Object.values(songsByArtist).reduce((sum, songs) => sum + songs.length, 0);

      console.log(`📊 Resumen:`);
      console.log(`   Artistas: ${artists.length}`);
      console.log(`   Canciones: ${totalSongs}\n`);

      // Show preview
      console.log('Preview (primeros 3 artistas):\n');
      artists.slice(0, 3).forEach(artist => {
        const songs = songsByArtist[artist];
        console.log(`${artist} (${songs.length} canciones)`);
        songs.slice(0, 3).forEach(song => console.log(`  - ${song}`));
        if (songs.length > 3) console.log(`  ... y ${songs.length - 3} más`);
        console.log('');
      });

    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

// Run
const generator = new SongListGenerator();
generator.run();