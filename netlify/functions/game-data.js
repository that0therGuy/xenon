export async function handler(event) {
    try {
        const { term, steamAppId } = event.queryStringParameters;

        // --- Steam search ---
        let steamData = null;
        if (term) {
            const steamRes = await fetch(
                `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=US`,
                {
                    headers: { "User-Agent": "Mozilla/5.0" }
                }
            );
            steamData = await steamRes.json();
        }

        // --- GG.deals ---
        let ggData = null;
        if (steamAppId) {
            const ggRes = await fetch(
                `https://api.gg.deals/v1/prices/by-steam-app-id/?ids=${steamAppId}&key=${process.env.GG_API_KEY}&region=us`
            );
            ggData = await ggRes.json();
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ steamData, ggData })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
}