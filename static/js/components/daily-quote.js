(() => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
    });
    const collections = new Map();

    function localTime(now) {
        const parts = Object.fromEntries(formatter.formatToParts(now)
            .map(part => [part.type, part.value]));
        return {
            date: `${parts.year}-${parts.month}-${parts.day}`,
            hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second)
        };
    }

    function hash(value) {
        let result = 2166136261;
        for (const character of value) {
            result = Math.imul(result ^ character.charCodeAt(0), 16777619);
        }
        return result >>> 0;
    }

    function selectQuote(quotes, time) {
        const morning = hash(`${time.date}:1`) % quotes.length;
        if (time.hour < 13) return quotes[morning];
        // An offset between 1 and N-1 guarantees a different afternoon ID.
        const offset = 1 + hash(`${time.date}:2`) % (quotes.length - 1);
        return quotes[(morning + offset) % quotes.length];
    }

    function loadQuotes(source) {
        if (!collections.has(source)) {
            const request = fetch(source).then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            }).then(quotes => {
                if (!Array.isArray(quotes) || quotes.length < 2 ||
                    !quotes.every(quote => Number.isInteger(quote.id) &&
                        typeof quote.autor === "string" && quote.autor.trim() &&
                        typeof quote.frase === "string" && quote.frase.trim()) ||
                    new Set(quotes.map(quote => quote.id)).size !== quotes.length) {
                    throw new Error("Coleção de frases inválida.");
                }
                return quotes;
            }).catch(error => {
                collections.delete(source);
                throw error;
            });
            collections.set(source, request);
        }
        return collections.get(source);
    }

    class DailyQuote extends HTMLElement {
        connectedCallback() {
            this.innerHTML = '<h2 class="daily-quote-title">FRASE DO DIA</h2>' +
                '<figure class="daily-quote-figure" aria-live="polite" aria-atomic="true">' +
                '<blockquote class="daily-quote-text">Carregando frase…</blockquote>' +
                '<figcaption class="daily-quote-author"></figcaption></figure>';
            this.onVisibility = () => {
                if (document.visibilityState === "visible" && this.quotes) this.updateQuote();
            };
            document.addEventListener("visibilitychange", this.onVisibility);
            loadQuotes(this.dataset.source).then(quotes => {
                if (!this.isConnected) return;
                this.quotes = quotes;
                this.updateQuote();
            }).catch(error => {
                if (!this.isConnected) return;
                this.querySelector(".daily-quote-text").textContent = "Não foi possível carregar a frase do dia.";
                console.error("Frase do Dia:", error);
            });
        }

        disconnectedCallback() {
            clearTimeout(this.timer);
            document.removeEventListener("visibilitychange", this.onVisibility);
        }

        updateQuote() {
            clearTimeout(this.timer);
            const now = new Date();
            const time = localTime(now);
            const quote = selectQuote(this.quotes, time);
            this.querySelector(".daily-quote-text").textContent = `“${quote.frase}”`;
            this.querySelector(".daily-quote-author").textContent = `— ${quote.autor}`;
            const boundary = time.hour < 13 ? 13 : 24;
            const seconds = (boundary - time.hour) * 3600 - time.minute * 60 - time.second;
            // Recheck each minute to recover from sleep or a changed system clock.
            this.timer = setTimeout(() => this.updateQuote(),
                Math.min(60000, seconds * 1000 - now.getMilliseconds() + 50));
        }
    }

    customElements.define("daily-quote", DailyQuote);
})();
