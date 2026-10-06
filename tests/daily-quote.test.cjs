const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const quotes = JSON.parse(fs.readFileSync('static/design-system/frases.txt', 'utf8'));
const source = fs.readFileSync('static/js/components/daily-quote.js', 'utf8');

function environment(instant) {
    let now = instant;
    let Component;
    let fetches = 0;
    let scheduled;
    const listeners = new Map();
    class Element {
        constructor() {
            this.dataset = { source: '/static/design-system/frases.txt' };
            this.isConnected = true;
            this.nodes = new Map();
        }
        querySelector(selector) {
            if (!this.nodes.has(selector)) this.nodes.set(selector, { textContent: '' });
            return this.nodes.get(selector);
        }
    }
    const context = vm.createContext({
        Intl, console, HTMLElement: Element,
        Date: class extends Date { constructor() { super(now); } },
        document: {
            visibilityState: 'visible',
            addEventListener: (name, fn) => listeners.set(name, fn),
            removeEventListener: name => listeners.delete(name)
        },
        customElements: { define: (name, type) => { Component = type; } },
        fetch: async () => { fetches++; return { ok: true, json: async () => quotes }; },
        setTimeout: (fn, delay) => { scheduled = { fn, delay }; return 1; },
        clearTimeout: () => { scheduled = undefined; }
    });
    vm.runInContext(source, context);
    return {
        context,
        setTime: value => { now = value; },
        mount: async () => {
            const element = new Component();
            element.connectedCallback();
            await new Promise(resolve => setImmediate(resolve));
            return element;
        },
        text: element => element.querySelector('.daily-quote-text').textContent,
        author: element => element.querySelector('.daily-quote-author').textContent,
        timer: () => scheduled,
        fetches: () => fetches
    };
}

test('São Paulo: stable periods, distinct IDs, automatic 13h and midnight updates', async () => {
    const env = environment('2026-10-06T03:00:00Z'); // 00:00 São Paulo
    const element = await env.mount();
    const morning = env.text(element);
    assert.ok(quotes.some(q => `“${q.frase}”` === morning && `— ${q.autor}` === env.author(element)));
    env.setTime('2026-10-06T15:59:59.000Z'); // 12:59:59
    element.updateQuote();
    assert.equal(env.text(element), morning);
    assert.equal(env.timer().delay, 1050);
    env.setTime('2026-10-06T16:00:00.050Z');
    env.timer().fn();
    const afternoon = env.text(element);
    const morningId = quotes.find(q => `“${q.frase}”` === morning).id;
    const afternoonId = quotes.find(q => `“${q.frase}”` === afternoon).id;
    assert.notEqual(morningId, afternoonId);
    env.setTime('2026-10-07T02:59:59Z'); // Still October 6 in São Paulo
    element.updateQuote();
    assert.equal(env.text(element), afternoon);
    env.setTime('2026-10-07T03:00:00Z');
    env.timer().fn();
    const fresh = environment('2026-10-07T03:00:00Z');
    assert.equal(env.text(element), fresh.text(await fresh.mount()));
    assert.notEqual(env.text(element), morning);
    for (const instant of ['2026-10-06T09:00:00Z', '2026-10-06T20:00:00Z']) {
        const first = environment(instant);
        const second = environment(instant);
        assert.equal(first.text(await first.mount()), second.text(await second.mount()));
    }
});

test('existing workspace restores Home; recreated component uses the same quote', async () => {
    const env = environment('2026-10-06T14:00:00Z');
    const initial = await env.mount();
    const expected = env.text(initial);
    const workspace = { innerHTML: '<daily-quote></daily-quote>' };
    let goHome;
    let initialize;
    const document = env.context.document;
    document.addEventListener = (name, fn) => { if (name === 'DOMContentLoaded') initialize = fn; };
    document.querySelector = selector => selector === '.workspace-content' ? workspace : null;
    document.querySelectorAll = () => [];
    document.getElementById = () => ({ addEventListener: (name, fn) => { goHome = fn; } });
    vm.runInContext(fs.readFileSync('static/js/workspace.js', 'utf8'), env.context);
    initialize();
    initial.isConnected = false;
    initial.disconnectedCallback();
    assert.equal(env.timer(), undefined);
    workspace.innerHTML = '<h1>Dashboard</h1>';
    goHome({ preventDefault() {} });
    assert.equal(workspace.innerHTML, '<daily-quote></daily-quote>');
    assert.equal(env.text(await env.mount()), expected);
    assert.equal(env.fetches(), 1);
});
