import { initGraph } from './graph.js';

export function startRealtimeUpdates() {
    setInterval(() => {
        fetch('/data')
            .then(res => res.json())
            .then(newData => {
                window.originalData = newData; // update global data
                initGraph(newData);
            })
            .catch(err => console.error('Realtime update failed:', err));
    }, 10000); // poll every 10 sec
}
