import { c as h, u as T, r, j as e, U as F } from './index-B2EmCfoI.js';
import { C as j, a as P } from './Shared-DyREwVhw.js';
import { P as D } from './plus-Ctp3jOZ5.js';
import { F as $ } from './filter-C99f0AWK.js';
import { M as E, S as H } from './send-tZNj7Uv4.js';
/**
 * @license lucide-react v0.445.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const N = h('CalendarClock', [
  ['path', { d: 'M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5', key: '1osxxc' }],
  ['path', { d: 'M16 2v4', key: '4m81vk' }],
  ['path', { d: 'M8 2v4', key: '1cmpym' }],
  ['path', { d: 'M3 10h5', key: 'r794hk' }],
  ['path', { d: 'M17.5 17.5 16 16.3V14', key: 'akvzfd' }],
  ['circle', { cx: '16', cy: '16', r: '6', key: 'qoo3c4' }],
]);
/**
 * @license lucide-react v0.445.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const B = h('ExternalLink', [
  ['path', { d: 'M15 3h6v6', key: '1q9fwt' }],
  ['path', { d: 'M10 14 21 3', key: 'gplh6r' }],
  ['path', { d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6', key: 'a6xqqp' }],
]);
/**
 * @license lucide-react v0.445.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const V = h('Linkedin', [
  [
    'path',
    {
      d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
      key: 'c2jq9f',
    },
  ],
  ['rect', { width: '4', height: '12', x: '2', y: '9', key: 'mk3on5' }],
  ['circle', { cx: '4', cy: '4', r: '2', key: 'bt5ra8' }],
]);
/**
 * @license lucide-react v0.445.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const G = h('Search', [
  ['circle', { cx: '11', cy: '11', r: '8', key: '4ej97u' }],
  ['path', { d: 'm21 21-4.3-4.3', key: '1qie3q' }],
]);
function Y() {
  const { industry: f, problem: y, revenue: b, runwayMonths: k, ltv: v, cac: S, addToast: C } = T(),
    I = [
      {
        name: 'Andreessen Horowitz',
        focus: 'Generalist/AI',
        stage: 'Seed–Series D',
        contact: 'Active',
        link: 'a16z.com',
        note: 'Warm intro via LP',
        next: '2026-03-20',
      },
      {
        name: 'Sequoia Capital',
        focus: 'Enterprise/SaaS',
        stage: 'Pre-seed–IPO',
        contact: 'Dormant',
        link: 'sequoiacap.com',
        note: 'Paused until Q2',
        next: '2026-04-05',
      },
      {
        name: 'Greylock',
        focus: 'Infrastructure/B2B',
        stage: 'Series A',
        contact: 'Active',
        link: 'greylock.com',
        note: 'Interested in data moat',
        next: '2026-03-28',
      },
      {
        name: 'Lightspeed',
        focus: 'Fintech/Consumer',
        stage: 'Early–Growth',
        contact: 'Interested',
        link: 'lsvp.com',
        note: 'Asked for KPI updates',
        next: '2026-03-18',
      },
    ],
    [x, u] = r.useState(I),
    [g, w] = r.useState(''),
    [c, z] = r.useState('All'),
    [o, d] = r.useState({
      name: '',
      focus: '',
      stage: '',
      contact: 'Active',
      link: '',
      note: '',
      next: '',
    }),
    [m, p] = r.useState(''),
    A = (t) => {
      const n = `Hi ${t.name},

We're building in ${f || 'our market'} to solve: ${y || 'a core customer pain'}. Traction: $${(b || 0).toLocaleString()} MRR, ${k} months runway, ${(v / S).toFixed(1)}x LTV/CAC. Would love to share a quick update.

`;
      navigator.clipboard.writeText(n).then(
        () => {
          (p('Intro template copied'), C('Intro copied to clipboard'));
        },
        () => p('Clipboard blocked — copy manually'),
      );
    },
    W = r.useMemo(
      () =>
        x.filter((t) => {
          const n = g.toLowerCase(),
            a =
              !n ||
              [t.name, t.focus, t.stage, t.contact, t.link, t.note].some((l) =>
                l.toLowerCase().includes(n),
              ),
            s = c === 'All' || t.contact === c;
          return a && s;
        }),
      [x, g, c],
    ),
    M = (t) => {
      if ((t.preventDefault(), !o.name || !o.focus || !o.stage)) {
        p('Name, focus, and stage required.');
        return;
      }
      (u((n) => [{ ...o, link: o.link || 'n/a', next: o.next || '2026-03-30' }, ...n]),
        d({ name: '', focus: '', stage: '', contact: 'Active', link: '', note: '', next: '' }),
        p('Investor added.'));
    },
    R = (t, n) => u((a) => a.map((s, l) => (l === t ? { ...s, contact: n } : s))),
    q = (t, n) => u((a) => a.map((s, l) => (l === t ? { ...s, next: n } : s))),
    L = x.reduce((t, n) => ((t[n.contact] = (t[n.contact] || 0) + 1), t), {}),
    i = {
      background: 'rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10,
      padding: '9px 11px',
      color: '#f0f4ff',
      fontSize: 13,
      fontWeight: 500,
      outline: 'none',
      width: '100%',
    };
  return e.jsxs('div', {
    style: { display: 'flex', flexDirection: 'column', gap: 28 },
    children: [
      e.jsxs('header', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 16,
        },
        children: [
          e.jsxs('div', {
            children: [
              e.jsxs('h1', {
                style: { fontSize: 30, fontWeight: 800, color: '#f0f4ff' },
                children: [
                  'Investor',
                  ' ',
                  e.jsx('span', {
                    style: {
                      background: 'linear-gradient(90deg,#6366f1,#a855f7)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    },
                    children: 'CRM',
                  }),
                ],
              }),
              e.jsx('p', {
                style: { color: '#8798b0', marginTop: 6, fontSize: 15 },
                children: 'Track outreach, follow-ups, and warm intros.',
              }),
            ],
          }),
          e.jsx('div', {
            style: { display: 'flex', gap: 10 },
            children: ['Active', 'Interested', 'Dormant'].map((t) =>
              e.jsxs(
                'div',
                {
                  style: {
                    padding: '9px 14px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#8798b0',
                    fontSize: 13,
                    fontWeight: 700,
                  },
                  children: [t, ': ', L[t] || 0],
                },
                t,
              ),
            ),
          }),
        ],
      }),
      e.jsxs(j, {
        children: [
          e.jsx(P, {
            icon: F,
            title: 'Positioning Snapshot',
            subtitle: 'Lead with this in every intro',
          }),
          e.jsxs('p', {
            style: { color: '#c7d2f0', fontSize: 14, lineHeight: 1.6 },
            children: [
              'Space: ',
              e.jsx('strong', { children: f || 'Set industry in sidebar' }),
              '. Problem solved:',
              ' ',
              e.jsx('strong', { children: y || 'Add the pain point in sidebar' }),
              '.',
            ],
          }),
        ],
      }),
      e.jsxs(j, {
        children: [
          e.jsxs('form', {
            onSubmit: M,
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(4,1fr) auto auto auto auto',
              gap: 10,
              marginBottom: 16,
              alignItems: 'end',
            },
            children: [
              [
                { key: 'name', placeholder: 'Firm Name *' },
                { key: 'focus', placeholder: 'Focus *' },
                { key: 'stage', placeholder: 'Stage *' },
                { key: 'link', placeholder: 'Website' },
                { key: 'note', placeholder: 'Notes' },
              ].map((t) =>
                e.jsx(
                  'input',
                  {
                    value: o[t.key],
                    onChange: (n) => d({ ...o, [t.key]: n.target.value }),
                    placeholder: t.placeholder,
                    style: i,
                  },
                  t.key,
                ),
              ),
              e.jsx('input', {
                type: 'date',
                value: o.next,
                onChange: (t) => d({ ...o, next: t.target.value }),
                style: i,
              }),
              e.jsx('select', {
                value: o.contact,
                onChange: (t) => d({ ...o, contact: t.target.value }),
                style: i,
                children: ['Active', 'Interested', 'Dormant'].map((t) =>
                  e.jsx('option', { value: t, style: { color: '#0f172a' }, children: t }, t),
                ),
              }),
              e.jsxs('button', {
                type: 'submit',
                style: {
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: '#10b981',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                },
                children: [e.jsx(D, { size: 14 }), ' Add'],
              }),
            ],
          }),
          e.jsxs('div', {
            style: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
            children: [
              e.jsxs('div', {
                style: { position: 'relative', flex: 1, minWidth: 220 },
                children: [
                  e.jsx(G, {
                    size: 16,
                    color: '#475569',
                    style: {
                      position: 'absolute',
                      left: 13,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    },
                  }),
                  e.jsx('input', {
                    value: g,
                    onChange: (t) => w(t.target.value),
                    placeholder: 'Search investors…',
                    style: { ...i, paddingLeft: 36 },
                  }),
                ],
              }),
              e.jsxs('div', {
                style: { display: 'flex', alignItems: 'center', gap: 8 },
                children: [
                  e.jsx($, { size: 14, color: '#8798b0' }),
                  e.jsx('select', {
                    value: c,
                    onChange: (t) => z(t.target.value),
                    style: { ...i, width: 'auto' },
                    children: ['All', 'Active', 'Interested', 'Dormant'].map((t) =>
                      e.jsx('option', { value: t, style: { color: '#0f172a' }, children: t }, t),
                    ),
                  }),
                ],
              }),
            ],
          }),
          e.jsx('div', {
            style: { overflowX: 'auto' },
            children: e.jsxs('table', {
              style: {
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 8px',
                minWidth: 700,
              },
              children: [
                e.jsx('thead', {
                  children: e.jsxs('tr', {
                    style: {
                      color: '#475569',
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      textAlign: 'left',
                    },
                    children: [
                      e.jsx('th', { style: { padding: '0 14px' }, children: 'Firm' }),
                      e.jsx('th', { children: 'Focus' }),
                      e.jsx('th', { children: 'Stage' }),
                      e.jsx('th', { children: 'Status' }),
                      e.jsx('th', { children: 'Next Touch' }),
                      e.jsx('th', {
                        style: { textAlign: 'right', paddingRight: 14 },
                        children: 'Actions',
                      }),
                    ],
                  }),
                }),
                e.jsx('tbody', {
                  children: W.map((t, n) =>
                    e.jsxs(
                      'tr',
                      {
                        style: { background: 'rgba(255,255,255,0.02)' },
                        children: [
                          e.jsx('td', {
                            style: { padding: '14px', borderRadius: '10px 0 0 10px' },
                            children: e.jsxs('div', {
                              style: { display: 'flex', alignItems: 'center', gap: 10 },
                              children: [
                                e.jsx('div', {
                                  style: {
                                    width: 30,
                                    height: 30,
                                    borderRadius: 8,
                                    background: 'rgba(99,102,241,0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#6366f1',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    flexShrink: 0,
                                  },
                                  children: t.name.charAt(0),
                                }),
                                e.jsxs('div', {
                                  children: [
                                    e.jsx('p', {
                                      style: { color: '#f0f4ff', fontWeight: 700, fontSize: 13 },
                                      children: t.name,
                                    }),
                                    t.note &&
                                      e.jsx('p', {
                                        style: { color: '#8798b0', fontSize: 11 },
                                        children: t.note,
                                      }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                          e.jsx('td', {
                            style: { color: '#8798b0', fontSize: 13, fontWeight: 600 },
                            children: t.focus,
                          }),
                          e.jsx('td', {
                            style: { color: '#8798b0', fontSize: 13, fontWeight: 600 },
                            children: t.stage,
                          }),
                          e.jsx('td', {
                            children: e.jsx('select', {
                              value: t.contact,
                              onChange: (a) => R(n, a.target.value),
                              style: {
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#f0f4ff',
                                padding: '7px 9px',
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 12,
                              },
                              children: ['Active', 'Interested', 'Dormant'].map((a) =>
                                e.jsx(
                                  'option',
                                  { value: a, style: { color: '#0f172a' }, children: a },
                                  a,
                                ),
                              ),
                            }),
                          }),
                          e.jsx('td', {
                            children: e.jsxs('div', {
                              style: { display: 'flex', alignItems: 'center', gap: 6 },
                              children: [
                                e.jsx(N, { size: 13, color: '#8798b0' }),
                                e.jsx('input', {
                                  type: 'date',
                                  value: t.next,
                                  onChange: (a) => q(n, a.target.value),
                                  style: {
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: '#f0f4ff',
                                    borderRadius: 8,
                                    padding: '7px 9px',
                                    fontWeight: 700,
                                    fontSize: 12,
                                  },
                                }),
                              ],
                            }),
                          }),
                          e.jsx('td', {
                            style: {
                              paddingRight: 14,
                              borderRadius: '0 10px 10px 0',
                              textAlign: 'right',
                            },
                            children: e.jsx('div', {
                              style: { display: 'flex', justifyContent: 'flex-end', gap: 6 },
                              children: [E, V, H, B].map((a, s) =>
                                e.jsx(
                                  'button',
                                  {
                                    onClick: s === 2 ? () => A(t) : void 0,
                                    style: {
                                      width: 30,
                                      height: 30,
                                      borderRadius: 7,
                                      background: 'rgba(255,255,255,0.05)',
                                      border: 'none',
                                      cursor: 'pointer',
                                      color: '#8798b0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    },
                                    children: e.jsx(a, { size: 13 }),
                                  },
                                  s,
                                ),
                              ),
                            }),
                          }),
                        ],
                      },
                      n,
                    ),
                  ),
                }),
              ],
            }),
          }),
          m &&
            e.jsx('p', {
              style: { color: '#10b981', fontSize: 12, fontWeight: 700, marginTop: 12 },
              children: m,
            }),
        ],
      }),
    ],
  });
}
export { Y as default };
