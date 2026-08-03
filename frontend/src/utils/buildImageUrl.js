import { baseURL } from '../../services/api.js';

// Normaliza caminhos de imagens e mídias para URLs absolutas válidas
export function buildImageUrl(value) {
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:')) return value;
    return `${baseURL}${value.startsWith('/') ? '' : '/'}${value}`;
}
