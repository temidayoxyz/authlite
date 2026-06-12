import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "AuthLite",
  description: "Secure, lightweight, and framework-agnostic authentication for Node.js.",
  base: '/authlite/',
  head: [
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'AuthLite — Lightweight Auth for Node.js' }],
    ['meta', { property: 'og:description', content: 'Secure, lightweight authentication library for SQLite.' }],
    ['meta', { property: 'og:image', content: '/authlite/logo.png' }],
    ['meta', { property: 'og:image:width', content: '500' }],
    ['meta', { property: 'og:image:height', content: '500' }],
    ['meta', { property: 'og:site_name', content: 'AuthLite' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'AuthLite — Lightweight Auth for Node.js' }],
    ['meta', { name: 'twitter:description', content: 'Secure, lightweight authentication library for SQLite.' }],
    ['meta', { name: 'twitter:image', content: '/authlite/logo.png' }],
  ],
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    logo: '/logo.png',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/core' },
      { text: 'Changelog', link: '/changelog' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Core', link: '/reference/core' },
          { text: 'SQLite Adapter', link: '/reference/sqlite' },
          { text: 'Next.js Helper', link: '/reference/nextjs' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/temidayoxyz/authlite' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: `© ${new Date().getFullYear()} <a href="https://github.com/temidayoxyz" target="_blank">Temidayo</a>`
    }
  }
})
