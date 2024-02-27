import { fileURLToPath } from 'url';

function dirname(path: string) {
    return path.substring(0, path.lastIndexOf('/'));
}

export const path = {
    join: (...paths) => {
        return paths.join('/');
    }
}
// Usage
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);