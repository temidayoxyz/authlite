<script setup lang="ts">
import { ref, onMounted } from "vue";

const copied = ref(false);

onMounted(() => {
  // Move button next to the page title (h1) instead of above it
  const h1 = document.querySelector(".vp-doc h1");
  const btn = document.querySelector(".copy-page-btn-wrapper");
  if (h1 && btn && h1.parentNode) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "baseline";
    wrapper.style.justifyContent = "space-between";
    wrapper.style.gap = "16px";
    wrapper.style.marginBottom = "16px";
    h1.parentNode.insertBefore(wrapper, h1);
    wrapper.appendChild(h1);
    wrapper.appendChild(btn);
  }
});

function copyPage() {
  const content = document.querySelector(".vp-doc");
  if (!content) return;

  const clone = content.cloneNode(true) as HTMLElement;

  // Remove copy button and injected wrapper from the clone
  clone.querySelectorAll(".copy-page-btn-wrapper").forEach((el) => el.remove());
  clone.querySelectorAll(".copy-page-title-row").forEach((el) => el.remove());

  // Remove line numbers from code blocks
  clone.querySelectorAll(".line-numbers-wrapper").forEach((el) => el.remove());

  let markdown = "";

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
  flex-shrink: 0;
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
  white-space: nowrap;
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
