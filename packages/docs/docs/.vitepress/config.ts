import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "AuthLite",
  description: "Secure, lightweight, and framework-agnostic authentication for Node.js.",
  base: '/authlite/',
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
