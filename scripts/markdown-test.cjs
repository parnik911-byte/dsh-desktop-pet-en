// quick markdown renderer smoke test
const fs = require("fs");
const vm = require("vm");
const code = fs.readFileSync("renderer/markdown.js", "utf8");
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(code, ctx);
const r = ctx.window.PetMarkdown.render;

const md = [
  "# Title",
  "This is **bold** and *italic* with `code`.",
  "",
  "- Item 1",
  "- Item 2",
  "",
  "1. First",
  "2. Second",
  "",
  "> Quote",
  "",
  "Code block:",
  "```js",
  "const x = 1 < 2 && 3 > 2;",
  "```",
  "",
  "Link [example](https://example.com) and auto https://auto.com",
  "",
  "<script>alert(1)</script>",
  "~~deleted~~",
].join("\n");

console.log(r(md));

// assertions
const out = r(md);
const checks = [
  ["escapes <script>", !out.includes("<script>") && out.includes("&lt;script&gt;")],
  ["heading", out.includes("<h1>Title</h1>")],
  ["bold", out.includes("<strong>bold</strong>")],
  ["italic", out.includes("<em>italic</em>")],
  ["inline code", out.includes("<code>code</code>")],
  ["ul", out.includes("<ul>") && out.includes("<li>Item 1</li>")],
  ["ol", out.includes("<ol>") && out.includes("<li>First</li>")],
  ["blockquote", out.includes("<blockquote>")],
  ["fenced code", out.includes("<pre><code class=\"language-js\">")],
  ["escaped code", out.includes("1 &lt; 2")],
  ["link", out.includes('<a href="https://example.com"')],
  ["autolink", out.includes('<a href="https://auto.com"')],
  ["strike", out.includes("<del>deleted</del>")],
];
let fail = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) fail++;
}
// javascript: link must be blocked
const xss = r("[x](javascript:alert(1))");
console.log(`${!xss.includes("href") ? "PASS" : "FAIL"}  javascript: link blocked`);
if (xss.includes("href")) fail++;
process.exit(fail ? 1 : 0);
