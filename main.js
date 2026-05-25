import { MoodDiary } from './mood-diary.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const diary = new MoodDiary();
    const ui = new UI(diary);
});