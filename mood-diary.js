
export class MoodDiary {
    constructor() {
        this.currentUser = null;
        this.entries = [];
        this.users = [];
        this.loadUsers();
        this.checkAutoLogin();
    }

    loadUsers() {
        const stored = localStorage.getItem('mood_users');
        this.users = stored ? JSON.parse(stored) : [];
    }

    saveUsers() {
        localStorage.setItem('mood_users', JSON.stringify(this.users));
    }

    checkAutoLogin() {
        const saved = localStorage.getItem('mood_current_user');
        if (saved && this.users.find(u => u.email === saved)) {
            this.currentUser = saved;
            this.loadEntries();
        }
    }

    loadEntries() {
        if (!this.currentUser) return;
        const stored = localStorage.getItem(`entries_${this.currentUser}`);
        this.entries = stored ? JSON.parse(stored) : [];
        this.sortEntries();
    }

    saveEntries() {
        if (this.currentUser) {
            localStorage.setItem(`entries_${this.currentUser}`, JSON.stringify(this.entries));
        }
    }

    sortEntries() {
        this.entries.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    register(email, password, name) {
        if (!email || !password) throw new Error('Заполните email и пароль');
        if (this.users.find(u => u.email === email)) throw new Error('Пользователь уже существует');
        this.users.push({ email, password: btoa(password), name: name || email.split('@')[0] });
        this.saveUsers();
        return true;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email);
        if (!user) throw new Error('Пользователь не найден');
        if (user.password !== btoa(password)) throw new Error('Неверный пароль');
        this.currentUser = email;
        localStorage.setItem('mood_current_user', this.currentUser);
        this.loadEntries();
        return user;
    }

    logout() {
        this.currentUser = null;
        this.entries = [];
        localStorage.removeItem('mood_current_user');
    }

    // НОВЫЙ МЕТОД
    addEntry(date, mood, note) {
        if (!date) throw new Error('Выберите дату');
        if (mood < 1 || mood > 5) throw new Error('Оценка от 1 до 5');
        if (note.length > 200) throw new Error('Заметка длиннее 200 символов');
        
        const newId = Date.now() + '-' + Math.floor(Math.random() * 10000);
        const newEntry = { id: newId, date, mood, note };
        this.entries.push(newEntry);
        this.sortEntries();
        this.saveEntries();
        return newId;
    }

    
    deleteEntry(id) {
        this.entries = this.entries.filter(e => e.id != id);
        this.saveEntries();
    }

    
    updateEntry(id, date, mood, note) {
        const index = this.entries.findIndex(e => e.id == id);
        if (index !== -1) {
            this.entries[index] = { id, date, mood, note };
            this.sortEntries();
            this.saveEntries();
        }
    }

    getEntriesByPeriod(start, end) {
        return this.entries.filter(e => {
            if (start && e.date < start) return false;
            if (end && e.date > end) return false;
            return true;
        });
    }

    getStats(entries) {
        if (entries.length === 0) {
            return { max:0, min:0, volatility7:0, bestDay:'—', worstDay:'—', mostActiveDay:'—', emotionalSummary:'Нет данных' };
        }
        const moods = entries.map(e => e.mood);
        const max = Math.max(...moods);
        const min = Math.min(...moods);
        const last7 = entries.slice(-7);
        const max7 = last7.length ? Math.max(...last7.map(e=>e.mood)) : max;
        const min7 = last7.length ? Math.min(...last7.map(e=>e.mood)) : min;
        const volatility7 = max7 - min7;

        const dayNames = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
        const sumDay = [0,0,0,0,0,0,0];
        const cntDay = [0,0,0,0,0,0,0];
        for (let e of entries) {
            const dow = new Date(e.date).getDay();
            sumDay[dow] += e.mood;
            cntDay[dow]++;
        }
        let bestIdx = -1, bestAvg = -1;
        let worstIdx = -1, worstAvg = 6;
        for (let i=0;i<7;i++) {
            if (cntDay[i]===0) continue;
            const avg = sumDay[i]/cntDay[i];
            if (avg > bestAvg) { bestAvg = avg; bestIdx = i; }
            if (avg < worstAvg) { worstAvg = avg; worstIdx = i; }
        }
        const bestDay = bestIdx !== -1 ? dayNames[bestIdx] : '—';
        const worstDay = worstIdx !== -1 ? dayNames[worstIdx] : '—';

        const actCnt = [0,0,0,0,0,0,0];
        for (let e of entries) actCnt[new Date(e.date).getDay()]++;
        let maxAct=0, actIdx=-1;
        for (let i=0;i<7;i++) if (actCnt[i]>maxAct) { maxAct=actCnt[i]; actIdx=i; }
        const mostActiveDay = actIdx!==-1 ? dayNames[actIdx] : '—';

        const avg = moods.reduce((a,b)=>a+b,0)/moods.length;
        let summary = '';
        if (avg >= 4.5) summary = '🔥 Отличное настроение!';
        else if (avg >= 3.5) summary = '🙂 Хорошо, но бывают спады';
        else if (avg >= 2.5) summary = '😐 Нейтрально, стабильно';
        else if (avg >= 1.5) summary = '😕 Требуется отдых';
        else summary = '😞 Серьёзный спад';
        return { max, min, volatility7, bestDay, worstDay, mostActiveDay, emotionalSummary: summary };
    }

    getMoodDistribution(entries) {
        const dist = {1:0,2:0,3:0,4:0,5:0};
        for (let e of entries) dist[e.mood]++;
        return dist;
    }

    getChartData(entries) {
        return { labels: entries.map(e => e.date), data: entries.map(e => e.mood) };
    }

    clearAll() {
        this.entries = [];
        this.saveEntries();
    }

    addSampleData() {
        const samples = [
            { date: '2026-05-01', mood: 4, note: 'Майские, солнце!' },
            { date: '2026-05-02', mood: 5, note: 'Пикник с друзьями' },
            { date: '2026-05-03', mood: 3, note: 'Немного устал' },
            { date: '2026-05-04', mood: 2, note: 'Голова болит' },
            { date: '2026-05-05', mood: 4, note: 'Работа спорится' },
            { date: '2026-05-06', mood: 5, note: 'Влюблён! Отличный день' },
            { date: '2026-05-07', mood: 3, note: 'Обычный день' },
            { date: '2026-05-08', mood: 4, note: 'Купил подарок' },
            { date: '2026-05-09', mood: 5, note: 'Выходной, счастье' }
        ];
        for (let s of samples) {
            // Можно добавлять несколько записей в один день, ID уникальные
            this.addEntry(s.date, s.mood, s.note);
        }
    }
}