export class UI {
    constructor(diary) {
        this.diary = diary;
        this.lineChart = null;
        this.pieChart = null;
        this.initElements();
        this.prepareDOM();
        this.initEventListeners();
        this.updateAuthUI();
    }

    // Поиск элементов по вашим ID и классам
    initElements() {
        this.themeToggle = document.getElementById('themeToggl');
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registBtn');
        this.logoutBtn = document.getElementById('logoutBtn');
        this.mainContent = document.getElementById('mainConten');
        this.preLoginMessage = document.getElementById('preLoginMessage');
        this.userInfoDiv = document.getElementById('userInfo');
        this.loggedUserSpan = document.querySelector('.loggetUserEmail');
        this.wisdomText = document.getElementById('wisdomText');
        this.wisdomBtn = document.getElementById('wisdomBtn');

        this.registerModal = document.getElementById('registerModal');
        this.loginModal = document.getElementById('loginModal');
        this.doRegisterBtn = document.getElementById('doRegisterBtn');
        this.doLoginBtn = document.getElementById('doLoginBtn');
        this.regEmail = document.getElementById('regEmail');
        this.regPassword = document.getElementById('regPassword');
        this.regName = document.getElementById('regName');
        this.regMessage = document.getElementById('regMessage');
        this.loginEmail = document.getElementById('loginEmail');
        this.loginPassword = document.getElementById('loginPassword');
        this.loginMessage = document.getElementById('loginMessage');

        this.addEntryBtn = document.getElementById('addEntryBtn');
        this.noteTextarea = document.getElementById('note');
        this.entryDate = document.getElementById('entryDate');
        this.moodGroup = document.querySelector('.mood-group');

        this.maxMoodSpan = document.getElementById('maxMood');
        this.minMoodSpan = document.getElementById('minMood');
        this.colebaniaSpan = document.getElementById('colebania');
        this.bestDaySpan = document.getElementById('bestDay');
        this.worstDaySpan = document.getElementById('worsDay');
        this.mostActiveDaySpan = document.getElementById('mostActiveDay');
        this.emotionalSummarySpan = document.getElementById('emotionalSummary');
        // this.refreshStatsBtn = document.getElementById('btn-secondary');

        this.startDateInput = document.getElementById('startDate');
        this.endDateInput = document.getElementById('endDate');
        this.filterBtn = document.getElementById('filterBtn');
        this.historyListDiv = document.getElementById('historyList');

        this.moodChartCanvas = document.getElementById('moodCharts');
        this.pieChartCanvas = document.getElementById('pieChart');
        // this.updateChartBtn = document.getElementById('updateChartBtn');
        this.updatePieBtn = document.getElementById('updatePieBtn');

        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.sampleDataBtn = document.getElementById('sampleDataBtn');

        this.toast = document.getElementById('toastMessage');
    }

    //Добавляем в DOM, 
    prepareDOM() {
        if (this.moodGroup) {
            const btns = this.moodGroup.querySelectorAll('button');
            const moods = [1, 2, 3, 4, 5];
            btns.forEach((btn, idx) => {
                if (!btn.getAttribute('type')) btn.setAttribute('type', 'button');
                const moodValue = moods[idx] || (idx + 1);
                if (!btn.hasAttribute('data-mood')) {
                    btn.setAttribute('data-mood', moodValue);
                }
                if (!btn.classList.contains('mood-btn')) {
                    btn.classList.add('mood-btn');
                }
                let ext = (moodValue === 1) ? '.gif' : '.png';
                btn.innerHTML = `<img src="icons/${moodValue}${ext}" style="width: 32px; height: 32px; margin-right: 6px; vertical-align: middle;"> ${moodValue}`;
            });
        }

        // Скрытое поле – без значения по умолчанию
        if (!document.getElementById('moodValue')) {
            const hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.id = 'moodValue';
            hidden.value = '';   // пусто – настроение не выбрано
            const form = document.querySelector('.entryForm');
            if (form) form.appendChild(hidden);
        }

        if (!document.querySelector('.char-counter') && this.noteTextarea) {
            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.textContent = '0 / 200';
            this.noteTextarea.insertAdjacentElement('afterend', counter);
        }
        this.charCounter = document.querySelector('.char-counter');

        if (this.entryDate && !this.entryDate.value) {
            this.entryDate.value = new Date().toISOString().split('T')[0];
        }

        const form = document.querySelector('.entryForm');
        if (form) form.addEventListener('submit', e => e.preventDefault());
    }

    // Все обработчики событий
    initEventListeners() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        if (this.loginBtn) this.loginBtn.addEventListener('click', () => this.showLoginModal());
        if (this.registerBtn) this.registerBtn.addEventListener('click', () => this.showRegisterModal());
        if (this.logoutBtn) this.logoutBtn.addEventListener('click', () => this.logout());

        if (this.doRegisterBtn) this.doRegisterBtn.addEventListener('click', (e) => { e.preventDefault(); this.register(); });
        if (this.doLoginBtn) this.doLoginBtn.addEventListener('click', (e) => { e.preventDefault(); this.login(); });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });
        window.addEventListener('click', (e) => {
            if (e.target === this.registerModal) this.registerModal.style.display = 'none';
            if (e.target === this.loginModal) this.loginModal.style.display = 'none';
        });

        if (this.noteTextarea && this.charCounter) {
            this.noteTextarea.addEventListener('input', () => {
                const len = this.noteTextarea.value.length;
                this.charCounter.textContent = `${len} / 200`;
                this.charCounter.style.color = len > 200 ? 'red' : '#888';
            });
        }

        if (this.addEntryBtn) this.addEntryBtn.addEventListener('click', (e) => { e.preventDefault(); this.addEntry(); });
        if (this.refreshStatsBtn) this.refreshStatsBtn.addEventListener('click', (e) => { e.preventDefault(); this.updateStats(); });
        if (this.filterBtn) this.filterBtn.addEventListener('click', (e) => { e.preventDefault(); this.applyFilter(); });
        if (this.updatePieBtn) this.updatePieBtn.addEventListener('click', (e) => { e.preventDefault(); this.updatePieChart(); });
        if (this.clearAllBtn) this.clearAllBtn.addEventListener('click', (e) => { e.preventDefault(); this.clearAll(); });
        if (this.sampleDataBtn) this.sampleDataBtn.addEventListener('click', (e) => { e.preventDefault(); this.loadSampleData(); });

        // Выбор настроения – подсветка и сохранение в скрытое поле
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mood = parseInt(btn.getAttribute('data-mood'));
                const moodHidden = document.getElementById('moodValue');
                if (moodHidden) moodHidden.value = mood;
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        if (this.wisdomBtn) {
    this.wisdomBtn.addEventListener('click', () => this.loadWisdom());
}
    }

    showRegisterModal() { if (this.registerModal) this.registerModal.style.display = 'flex'; }
    showLoginModal() { if (this.loginModal) this.loginModal.style.display = 'flex'; }

    register() {
        try {
            const email = this.regEmail.value.trim();
            const pass = this.regPassword.value.trim();
            const name = this.regName.value.trim();
            this.diary.register(email, pass, name);
            this.regMessage.textContent = 'Регистрация успешна! Теперь войдите.';
            this.regMessage.style.color = 'green';
            setTimeout(() => {
                this.registerModal.style.display = 'none';
                this.showLoginModal();
            }, 1500);
        } catch (e) {
            this.regMessage.textContent = e.message;
            this.regMessage.style.color = 'red';
        }
    }

    login() {
        try {
            const email = this.loginEmail.value.trim();
            const pass = this.loginPassword.value.trim();
            const user = this.diary.login(email, pass);
            this.loginModal.style.display = 'none';
            this.updateAuthUI(true, user.name);
            this.refreshAll();
            this.showToast(`Добро пожаловать, ${user.name}!`);
        } catch (e) {
            this.loginMessage.textContent = e.message;
            this.loginMessage.style.color = 'red';
        }
    }

    logout() {
        this.diary.logout();
        this.updateAuthUI(false);
        this.clearInterface();
        this.showToast('Вы вышли');
    }

    updateAuthUI(loggedIn = null, name = '') {
        const isLogged = loggedIn !== null ? loggedIn : (this.diary.currentUser !== null);
        if (isLogged) {
            if (this.userInfoDiv) this.userInfoDiv.style.display = 'flex';
            if (this.loggedUserSpan) this.loggedUserSpan.textContent = name || this.diary.currentUser.split('@')[0];
            if (this.mainContent) this.mainContent.classList.remove('hidden');
            if (this.preLoginMessage) this.preLoginMessage.style.display = 'none';
            if (this.loginBtn) this.loginBtn.style.display = 'none';
            if (this.registerBtn) this.registerBtn.style.display = 'none';
            document.body.classList.add('logged-in'); 
        this.loadWisdom()
        } else {
            if (this.userInfoDiv) this.userInfoDiv.style.display = 'none';
            if (this.mainContent) this.mainContent.classList.add('hidden');
            if (this.preLoginMessage) this.preLoginMessage.style.display = 'block';
            if (this.loginBtn) this.loginBtn.style.display = 'inline-block';
            if (this.registerBtn) this.registerBtn.style.display = 'inline-block';
            document.body.classList.remove('logged-in');
            
        }
    }

    refreshAll() {
        this.updateStats();
        this.updateHistory();
        this.updateLineChart();
        this.updatePieChart();
    }

    updateStats() {
        if (!this.diary.currentUser) return;
        const start = this.startDateInput?.value;
        const end = this.endDateInput?.value;
        const entries = this.diary.getEntriesByPeriod(start, end);
        const stats = this.diary.getStats(entries);
        if (this.maxMoodSpan) this.maxMoodSpan.textContent = stats.max;
        if (this.minMoodSpan) this.minMoodSpan.textContent = stats.min;
        if (this.colebaniaSpan) this.colebaniaSpan.textContent = stats.volatility7;
        if (this.bestDaySpan) this.bestDaySpan.textContent = stats.bestDay;
        if (this.worstDaySpan) this.worstDaySpan.textContent = stats.worstDay;
        if (this.mostActiveDaySpan) this.mostActiveDaySpan.textContent = stats.mostActiveDay;
        if (this.emotionalSummarySpan) this.emotionalSummarySpan.textContent = stats.emotionalSummary;
    }
updateHistory() {
    if (!this.diary.currentUser) {
        if (this.historyListDiv) this.historyListDiv.innerHTML = '<p>Войдите, чтобы видеть историю</p>';
        return;
    }
    const start = this.startDateInput?.value;
    const end = this.endDateInput?.value;
    let entries = this.diary.getEntriesByPeriod(start, end);
    if (entries.length === 0) {
        this.historyListDiv.innerHTML = '<p>Нет записей</p>';
        return;
    }
    entries = [...entries].reverse();
    
    // ТОЛЬКО ЭТО ИЗМЕНЕНИЕ - для mood=1 используем .gif, для остальных .png
    const moodIcon = (m) => {
        const ext = (m === 1) ? 'gif' : 'png';
        return `<img src="icons/${m}.${ext}" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;">`;
    };
    
    let html = '';
    for (let e of entries) {
        html += `
            <div class="history-item">
                <div class="history-date">📅 ${e.date}</div>
                <div class="history-mood">${moodIcon(e.mood)} Оценка: ${e.mood}/5</div>
                <div class="history-note">📝 ${this.escapeHtml(e.note)}</div>
                <div class="history-actions">
                <button class="delete-entry" data-id="${e.id}">🗑️</button>
                </div>
            </div>
        `;
    }
    this.historyListDiv.innerHTML = html;
    
    document.querySelectorAll('.edit-entry').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); this.editEntry(btn.dataset.date); });
    });
    document.querySelectorAll('.delete-entry').forEach(btn => {
        btn.addEventListener('click', (e) => { e.preventDefault(); this.deleteEntry(btn.dataset.id); });
    });
}

    editEntry(id) {
        const entry = this.diary.entries.find(e => e.id === id);
        if (entry) {
            this.entryDate.value = entry.date;
            this.noteTextarea.value = entry.note;
            const moodHidden = document.getElementById('moodValue');
            if (moodHidden) moodHidden.value = entry.mood;
            document.querySelectorAll('.mood-btn').forEach(btn => {
                if (parseInt(btn.getAttribute('data-mood')) === entry.mood) {
                    btn.classList.add('active');
                } else btn.classList.remove('active');
            });
            this.diary.deleteEntry(id);
            this.refreshAll();
            this.showToast('Теперь измените и сохраните');
        }
    }

    deleteEntry(id) {
        if (confirm(`Удалить запись за ${id}?`)) {
            this.diary.deleteEntry(id);
            this.refreshAll();
            this.showToast('Запись удалена');
        }
    }

    applyFilter() {
        this.updateStats();
        this.updateHistory();
        this.updateLineChart();
        this.updatePieChart();
    }

    addEntry() {
        if (!this.diary.currentUser) return;
        try {
            const date = this.entryDate.value;
            const moodHidden = document.getElementById('moodValue');
            
            let mood;
            if (moodHidden && moodHidden.value !== '') {
                mood = parseInt(moodHidden.value);
            } else {
                mood = NaN;
            }
            const note = this.noteTextarea.value.trim();

            if (!date) throw new Error('Выберите дату');
            if (!note) throw new Error('Напишите заметку');
            if (isNaN(mood) || mood < 1 || mood > 5) {
                throw new Error('Выберите настроение (нажмите на смайлик)');
            }

            this.diary.addEntry(date, mood, note);
            this.refreshAll();
            this.resetForm();
            this.showToast('Запись сохранена');
        } catch (err) {
            this.showToast(err.message, true);
        }
    }





resetForm() {
        this.noteTextarea.value = '';
        if (this.charCounter) this.charCounter.textContent = '0 / 200';
        this.entryDate.value = new Date().toISOString().split('T')[0];

        const moodHidden = document.getElementById('moodValue');
        if (moodHidden) moodHidden.value = '';   

        
        document.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('active'));
        
    }

    clearInterface() {
        if (this.maxMoodSpan) this.maxMoodSpan.textContent = '0';
        if (this.minMoodSpan) this.minMoodSpan.textContent = '0';
        if (this.colebaniaSpan) this.colebaniaSpan.textContent = '0';
        if (this.bestDaySpan) this.bestDaySpan.textContent = '?';
        if (this.worstDaySpan) this.worstDaySpan.textContent = '?';
        if (this.mostActiveDaySpan) this.mostActiveDaySpan.textContent = '?';
        if (this.emotionalSummarySpan) this.emotionalSummarySpan.textContent = 'Войдите';
        if (this.historyListDiv) this.historyListDiv.innerHTML = '<p>Войдите, чтобы видеть историю</p>';
        if (this.lineChart) this.lineChart.destroy();
        if (this.pieChart) this.pieChart.destroy();
        this.lineChart = null;
        this.pieChart = null;
    }

    updateLineChart() {
        if (!this.diary.currentUser || !this.moodChartCanvas) return;
        const start = this.startDateInput?.value;
        const end = this.endDateInput?.value;
        const entries = this.diary.getEntriesByPeriod(start, end);
        if (entries.length === 0) {
            if (this.lineChart) this.lineChart.destroy();
            return;
        }
        const { labels, data } = this.diary.getChartData(entries);
        if (this.lineChart) this.lineChart.destroy();
        this.lineChart = new Chart(this.moodChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Настроение (1-5)',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102,126,234,0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: { y: { min: 1, max: 5, stepSize: 1, title: { display: true, text: 'Оценка' } } }
            }
        });
    }

    updatePieChart() {
        if (!this.diary.currentUser || !this.pieChartCanvas) return;
        const start = this.startDateInput?.value;
        const end = this.endDateInput?.value;
        const entries = this.diary.getEntriesByPeriod(start, end);
        if (entries.length === 0) {
            if (this.pieChart) this.pieChart.destroy();
            return;
        }
        const dist = this.diary.getMoodDistribution(entries);
        const labels = ['😞 1', '😕 2', '😐 3', '🙂 4', '😊 5'];
        const data = [dist[1], dist[2], dist[3], dist[4], dist[5]];
        if (this.pieChart) this.pieChart.destroy();
        this.pieChart = new Chart(this.pieChartCanvas, {
            type: 'pie',
            data: { labels, datasets: [{ data, backgroundColor: ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac'] }] },
            options: { responsive: true }
        });
    }

    clearAll() {
        if (confirm('Удалить ВСЕ записи? Отменить нельзя!')) {
            this.diary.clearAll();
            this.refreshAll();
            this.showToast('Все данные очищены');
        }
    }

    loadSampleData() {
        if (confirm('Загрузить пример данных?')) {
            this.diary.addSampleData();
            this.refreshAll();
            this.showToast('Примеры добавлены');
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        if (this.themeToggle) {
            this.themeToggle.textContent = isDark ? 'Светлая тема ☀️' : 'Тёмная тема 🌙';
        }
        localStorage.setItem('moodTheme', isDark ? 'dark' : 'light');
    }

    showToast(msg, isError = false) {
        if (!this.toast) return;
        this.toast.textContent = msg;
        this.toast.classList.add('show');
        setTimeout(() => this.toast.classList.remove('show'), 2500);
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    async fetchRandomQuote() {
    try {
        const response = await fetch('https://quoteslate.vercel.app/api/quotes/random');
        const data = await response.json();
        return `«${data.quote}» — ${data.author}`;
    } catch (error) {
        return '«Сложность — это задача, которую ещё не решили» — Мудрость дня';
    }
}

async loadWisdom() {
    if (!this.wisdomText) return;
    if (!this.diary.currentUser) {
        this.wisdomText.textContent = 'Войдите, чтобы увидеть мудрость дня';
        return;
    }
    this.wisdomText.textContent = '✨ Загрузка...';
    const quote = await this.fetchRandomQuote();
    this.wisdomText.textContent = quote;
}
}