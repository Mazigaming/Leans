import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

const GUILD_NAME = 'Leans';
const REALMEYE_URL = `https://www.realmeye.com/guild/${GUILD_NAME}`;
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'guild-stats.json');

async function scrapeGuildStats() {
  try {
    console.log(`Fetching guild stats from ${REALMEYE_URL}...`);
    
    const response = await fetch(REALMEYE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    const memberMatch = html.match(/>Members<[\s\S]*?>(\d+)</i) ||
                       html.match(/members[^>]*?:\s*<[^>]*>(\d+)/i) ||
                       html.match(/>\s*(\d+)\s*<[^>]*>members/i) ||
                       html.match(/>(\d+)<\/[^>]*>\s*members/i);
    
    const members = memberMatch ? parseInt(memberMatch[1]) : null;

    const fameMatch = html.match(/<span class="numeric">([0-9]+)<\/span>\s*\(<a[^>]*top-guilds-by-fame">\s*(\d+)/i);
    const totalAliveFrame = fameMatch ? parseInt(fameMatch[1]) : null;
    const worldRank = fameMatch ? parseInt(fameMatch[2]) : null;

    const stats = {
      guildName: GUILD_NAME,
      members: members,
      totalAliveFrame: totalAliveFrame,
      worldRank: worldRank,
      lastUpdated: new Date().toISOString(),
      source: 'realmeye'
    };

    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(stats, null, 2));
    console.log(`✓ Stats saved to ${OUTPUT_FILE}`);
    console.log(JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('Error scraping guild stats:', error.message);
    process.exit(1);
  }
}

scrapeGuildStats();
