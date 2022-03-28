

let backendInstance;

export function setBackend(b) {
    backendInstance = b
}

export function getBackend() {
    if (!backendInstance) {
        throw new Error('Backend is not set');
    }

    return backendInstance;
}

function enrich() {



}