export const View = {
    showModal(title,msg,buttons) {
        const m = document.getElementById('customModal');
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = msg;
        const act = document.getElementById('modalActions'); act.innerHTML = '';
        buttons.forEach(b => {
            const btn = document.createElement('button'); btn.textContent = b.text; btn.className = `western-btn ${b.class}`; btn.onclick = b.action; act.appendChild(btn);
        });
        m.classList.add('active');
    },
    closeModal() { document.getElementById('customModal').classList.remove('active'); },
    showToast(pName, ach) {
        const t = document.getElementById('achievementToast');
        document.getElementById('achPlayerName').textContent = pName;
        document.getElementById('achEmoji').textContent = ach.emoji;
        document.getElementById('achName').textContent = ach.name;
        t.classList.add('show');
        setTimeout(()=>t.classList.remove('show'), 3500);
    }
};