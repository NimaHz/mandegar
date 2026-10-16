import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { renderMarkdown } from "./markdown";

const TAG = /<[^>]*>?/g;

const RENDERED_TAG =
  /^<\/?(?:p|a|img|h[2-4]|em|strong|del|code|pre|ul|ol|li|blockquote|hr|br|div|table|thead|tbody|tr|th|td|bdi|input)((?: [a-z-]+="[^"<>]*")*)>$/;

const ATTRIBUTE = / ([a-z-]+)="([^"<>]*)"/g;

const SAFE_URL = /^(?:https?:|mailto:|tel:|\/(?![/\\])|#)/i;

const assertInert = (source: string) => {
  const html = renderMarkdown(source);
  const context = `${JSON.stringify(source)} => ${html}`;
  for (const tag of html.match(TAG) ?? []) {
    const attributes = RENDERED_TAG.exec(tag)?.[1];
    assert.notEqual(attributes, undefined, context);
    for (const [, name = "", value = ""] of (attributes ?? "").matchAll(ATTRIBUTE)) {
      assert.doesNotMatch(name, /^on/i, context);
      if (name === "href" || name === "src") assert.match(value, SAFE_URL, context);
    }
  }
  return html;
};

const rawBlockPayloads = [
  "<code><img/src=x onerror=alert(1)>",
  "a <code>b <svg/onload=alert(4)> c",
  "<code><img/src=x onerror=fetch('/api/admin/users',{method:'POST',credentials:'include'})>",
  "x <pre><img/src=x onerror=alert(1)>",
  "x <script>alert(1)</script><img/src=x onerror=alert(2)>",
  "x <script><svg/onload=alert(1)>",
  "x <kbd><svg/onload=alert(1)></kbd> <svg/onload=alert(2)>",
  "x <CODE><IMG/SRC=x ONERROR=alert(1)>",
  'x <code class="a"><svg/onload=alert(1)>',
  "x <code><kbd><pre><img/src=x onerror=alert(1)></pre></kbd></code> <img/src=y onerror=alert(2)>",
  "x <code>a</code> <img/src=x onerror=alert(1)> <kbd>b <svg/onload=alert(2)>",
  "x <code>\n\n<img/src=x onerror=alert(1)>\n\n- <svg/onload=alert(2)>",
  "x </code><svg/onload=alert(1)> <code><svg/onload=alert(2)>",
  "[<code>](/a) <svg/onload=alert(1)>",
  "[x <kbd>](https://example.com) <svg/onload=alert(1)>",
  "**<kbd>** <svg/onload=alert(1)> _<pre>_ <svg/onload=alert(2)>",
  "- <code>\n- <svg/onload=alert(1)>",
  "| a | b |\n| --- | --- |\n| <code> | <svg/onload=alert(1)> |",
  "## <code> <svg/onload=alert(1)>",
  "> <pre> <svg/onload=alert(1)>",
  "x <code>&lt;img src=x onerror=alert(1)&gt; &#60;svg onload=alert(1)&#62;",
];

const htmlPayloads = [
  "<script>alert(1)</script>",
  "<pre>\n<img src=x onerror=alert(1)>\n</pre>",
  "<kbd><img src=x onerror=alert(1)></kbd>",
  "<img src=x onerror=alert(1)>",
  '<a href="javascript:alert(1)">x</a>',
  "<iframe src=javascript:alert(1)></iframe>",
  "<!-- <script>alert(1)</script> -->",
  "<style>body{display:none}</style>",
  "<div>\n\n<svg/onload=alert(1)>\n\n</div>",
  "```html\n</code></pre><script>alert(1)</script>\n```",
  "`</code><script>alert(1)</script>`",
  "    </code></pre><img src=x onerror=alert(1)>",
];

const urlPayloads = [
  "[x](javascript:alert(1))",
  "[x](JaVaScRiPt:alert(1))",
  "[x]( javascript:alert(1) )",
  "[x](<javascript:alert(1)>)",
  "<javascript:alert(1)>",
  "[x][r]\n\n[r]: javascript:alert(1)",
  "[x](&#106;avascript:alert(1))",
  "[x](java\tscript:alert(1))",
  "[x](vbscript:msgbox(1))",
  "[x](//evil.example)",
  "[x](/\\evil.example)",
  "![x](data:image/svg+xml,<svg/onload=alert(1)>)",
  "![x](data:image/png;base64,iVBORw0KGgo=)",
  "![x](DATA:text/html,<script>alert(1)</script>)",
  "[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)",
  "![x](javascript:alert(1))",
];

describe("markdown sanitising", () => {
  it("escapes text after an unclosed raw-block tag", () => {
    assert.equal(
      renderMarkdown("<code><img/src=x onerror=alert(1)>"),
      "<p>&lt;code&gt;&lt;img/src=x onerror=alert(1)&gt;</p>\n",
    );
    assert.equal(
      renderMarkdown("a <code>b <svg/onload=alert(4)> c"),
      "<p>a &lt;code&gt;b &lt;svg/onload=alert(4)&gt; c</p>\n",
    );
  });

  it("never passes raw HTML through, whatever the lexer state", () => {
    for (const payload of [...rawBlockPayloads, ...htmlPayloads]) {
      const html = assertInert(payload);
      assert.doesNotMatch(html, /<(?:script|svg|iframe|style|kbd|!--)|<img[^>]*onerror/i, html);
    }
  });

  it("drops javascript: and data: links and images", () => {
    for (const payload of urlPayloads) {
      const html = assertInert(payload);
      assert.doesNotMatch(html, /<a |<img /, html);
    }
  });

  it("keeps quotes inside attribute values", () => {
    assert.equal(
      assertInert('[x](/a "b\\" onmouseover=alert(1) c") ![y" onerror="alert(1)](/b.webp)'),
      '<p><a href="/a" title="b&quot; onmouseover=alert(1) c">x</a> <img src="/b.webp" alt="y&quot; onerror=&quot;alert(1)" loading="lazy" decoding="async"></p>\n',
    );
  });

  it("keeps safe links and library images", () => {
    assert.equal(
      assertInert("[x](https://example.com) ![نما](/uploads/2026/10/a.webp)"),
      '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a> <img src="/uploads/2026/10/a.webp" alt="نما" loading="lazy" decoding="async"></p>\n',
    );
  });
});

describe("markdown entities", () => {
  it("keeps valid entities and encodes bare ampersands once", () => {
    assert.equal(renderMarkdown("Tom &amp; Jerry"), "<p>Tom &amp; Jerry</p>\n");
    assert.equal(
      renderMarkdown("a&nbsp;b &laquo;x&raquo; &copy;"),
      "<p>a&nbsp;b &laquo;x&raquo; &copy;</p>\n",
    );
    assert.equal(renderMarkdown("AT&T &copy 2026"), "<p>AT&amp;T &amp;copy 2026</p>\n");
    assert.equal(renderMarkdown("&#60;b&#62; &#x3C;i&#x3E;"), "<p>&lt;b&gt; &lt;i&gt;</p>\n");
    assert.equal(
      renderMarkdown("<kbd>Tom &amp; Jerry &copy"),
      "<p>&lt;kbd&gt;Tom &amp; Jerry &amp;copy</p>\n",
    );
  });

  it("shows autolink text exactly as written", () => {
    assert.equal(
      renderMarkdown("<https://a.example/?a=1&amp;b=2> https://b.example/?c&copy;=3"),
      '<p><a href="https://a.example/?a=1&amp;amp;b=2" target="_blank" rel="noopener noreferrer">https://a.example/?a=1&amp;amp;b=2</a> <a href="https://b.example/?c&amp;copy;=3" target="_blank" rel="noopener noreferrer">https://b.example/?c&amp;copy;=3</a></p>\n',
    );
  });

  it("isolates model codes next to entities", () => {
    assert.equal(
      renderMarkdown("MGH-9000 &amp; MC-4500"),
      '<p><bdi dir="ltr" class="whitespace-nowrap">MGH-9000</bdi> &amp; <bdi dir="ltr" class="whitespace-nowrap">MC-4500</bdi></p>\n',
    );
  });
});
