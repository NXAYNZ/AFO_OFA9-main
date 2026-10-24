// Mock data and AI output carry decorative emoji; the interface draws its own icons instead.
// Built with the RegExp constructor because the TS target (ES2017) rejects \p{} literals.
const EMOJI = new RegExp('[\\p{Extended_Pictographic}\\u{1F1E6}-\\u{1F1FF}\\u{FE0F}\\u{200D}\\u{20E3}]', 'gu');

export const stripEmoji = (text: string): string => text.replace(EMOJI, '').replace(/\s{2,}/g, ' ').trim();
