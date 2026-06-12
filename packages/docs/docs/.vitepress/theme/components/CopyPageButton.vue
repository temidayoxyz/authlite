<script setup lang="ts">
import { ref } from "vue";

const copied = ref(false);

function copyPage() {
  // Get the main content area
  const content = document.querySelector(".vp-doc");
  if (!content) return;

  // Clone the content to avoid modifying the DOM
  const clone = content.cloneNode(true) as HTMLElement;

  // Remove copy button itself from the clone
  clone.querySelectorAll(".copy-page-btn-wrapper").forEach((el) => el.remove());

  // Remove line numbers from code blocks
  clone.querySelectorAll(".line-numbers-wrapper").forEach((el) => el.remove());

  // Extract text content with structure preserved
  let markdown = "";

  // Walk through top-level elements
  const walk = (el: Element) => {
    for (const child of el.children) {
      const tag = child.tagName.toLowerCase();

      if (/^h[1-6]$/.test(tag)) {
        const level = parseInt(tag[1]);
        const text = child.textContent?.trim() || "";
        markdown += `${"#".repeat(level)} ${text}\n\n`;
      } else if (tag === "p") {
        const text = child.textContent?.trim() || "";
        if (text) markdown += `${text}\n\n`;
      } else if (tag === "pre") {
        const code = child.querySelector("code");
        const lang = code?.className?.replace("language-", "") || "";
        const codeText = code?.textContent || "";
        markdown += `\`\`\`${lang}\n${codeText}\n\`\`\`\n\n`;
      } else if (tag === "ul") {
        for (const li of child.querySelectorAll(":scope > li")) {
          const text = li.textContent?.trim() || "";
          if (text) markdown += `- ${text}\n`;
        }
        markdown += "\n";
      } else if (tag === "ol") {
        let idx = 1;
        for (const li of child.querySelectorAll(":scope > li")) {
          const text = li.textContent?.trim() || "";
          if (text) markdown += `${idx}. ${text}\n`;
          idx++;
        }
        markdown += "\n";
      } else if (tag === "table") {
        // Copy table content in markdown-ish format
        const rows = child.querySelectorAll("tr");
        for (const row of rows) {
          const cells = row.querySelectorAll("th, td");
          const cellTexts = Array.from(cells).map(
            (c) => (c.textContent || "").trim()
          );
          markdown += `| ${cellTexts.join(" | ")} |\n`;
        }
        markdown += "\n";
      } else if (tag === "hr") {
        markdown += "---\n\n";
      } else {
        walk(child);
      }
    }
  };

  walk(clone);

  // Fallback: if markdown is empty, just copy text
  const finalText = markdown.trim() || content.textContent?.trim() || "";

  navigator.clipboard.writeText(finalText).then(() => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
}
</script>

<template>
  <span class="copy-page-btn-wrapper">
    <button class="copy-page-btn" @click="copyPage" :title="copied ? 'Copied!' : 'Copy page content'">
      <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>{{ copied ? 'Copied!' : 'Copy page' }}</span>
    </button>
  </span>
</template>

<style scoped>
.copy-page-btn-wrapper {
  display: inline-flex;
  align-items: center;
}

.copy-page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-page-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
  background: var(--vp-c-bg);
}

.copy-page-btn svg {
  flex-shrink: 0;
}
</style>
