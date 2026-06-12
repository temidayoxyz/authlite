import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "AuthLite",
  description: "Secure, lightweight, and framework-agnostic authentication.",
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    logo: '/logo.png',
    editLink: {
      pattern: 'https://github.com/temidayoxyz/authlite/edit/main/packages/docs/docs/:path',
      text: 'Edit this page on GitHub'
    },
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/core' },
      { text: 'GitHub', link: 'https://github.com/temidayoxyz/authlite' }
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
      copyright: 'Copyright © 2026-present Temidayo'
    }
  }
})
