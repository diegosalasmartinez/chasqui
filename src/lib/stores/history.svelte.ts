import type { Api, HistoryItem, Response } from '$lib/types/http';

class HistoryStore {
    // Only store last 30 items
    history = $state<HistoryItem[]>([]);

    addItem(api: Api, response: Response) {
        this.history.push({
            at_ms: Date.now(),
            api,
            response
        });

        // Cap history length to last 30 items
        if (this.history.length > 30) {
            this.history.splice(0, this.history.length - 30);
        }
    }
}

export default HistoryStore;
