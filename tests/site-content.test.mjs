import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = new URL("..", import.meta.url).pathname;
const indexPath = join(root, "index.html");
const packagePath = join(root, "package.json");

assert.ok(existsSync(indexPath), "index.html should exist");

const html = readFileSync(indexPath, "utf8");
const css = readFileSync(join(root, "styles.css"), "utf8");
const script = readFileSync(join(root, "script.js"), "utf8");
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

function readPngSize(path) {
  const png = readFileSync(path);

  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  };
}

test("single page includes the required buying sections", () => {
  for (const label of ["매입 가능 품목", "매입 절차", "최근 매입 사례", "자주 묻는 질문"]) {
    assert.match(html, new RegExp(label), `${label} section should be present`);
  }
});

test("site branding uses the requested Korean business name", () => {
  assert.match(html, /<title>우리 폐초경 \| 폐초경 정직 매입<\/title>/, "document title should use 우리 폐초경");
  assert.match(html, /<strong>우리 폐초경<\/strong>/, "header brand should use 우리 폐초경");
  assert.doesNotMatch(html, /카바이드마켓/, "old carbide-market branding should be removed");
});

test("kakao consultation links are wired as external calls to action", () => {
  const kakaoLinks = html.match(/href="https:\/\/(?:pf|open)\.kakao\.com\/[^"]+"/g) ?? [];
  assert.ok(kakaoLinks.length >= 2, "at least two KakaoTalk CTA links should be present");
  assert.match(html, /target="_blank"/, "external KakaoTalk links should open in a new tab");
  assert.match(html, /rel="noopener"/, "external KakaoTalk links should use noopener");
});

test("kakao consultation reuses one chat window and ignores rapid repeat clicks", () => {
  assert.match(script, /kakaoChatOpening/, "Kakao CTA clicks should have a short repeat-click lock");
  assert.match(
    script,
    /window\.open\(link\.href,\s*"carbide-kakao-consultation"\)/,
    "Kakao CTA clicks should reuse one named chat window",
  );
  assert.match(script, /kakaoChatWindow\.focus\(\)/, "an existing Kakao chat window should be focused");
});

test("contact page keeps consultation phone numbers on one line", () => {
  const contactSection = html.match(/<section id="contact"[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.match(
    contactSection,
    /class="[^"]*contact-phone-line[^"]*"[\s\S]*전화 상담[\s\S]*href="tel:010-3349-3390"[\s\S]*010-3349-3390[\s\S]*href="tel:010-3213-3390"[\s\S]*010-3213-3390/,
    "contact phone numbers should be grouped with the consultation label",
  );
  assert.match(
    css,
    /\.contact-phone-line\s*\{[\s\S]*display:\s*flex[\s\S]*flex-wrap:\s*nowrap/,
    "contact phone line should keep the label and numbers on one row",
  );
});

test("page follows the bright market-style landing reference", () => {
  assert.match(html, /쌓아둔 폐초경, 당일 단가로 투명하게 매입합니다\./, "main hero should stay unchanged");
  assert.match(html, /href="#cases"/, "navigation should jump to buying cases");
  assert.match(html, /010-3349-3390/, "primary phone CTA should be visible");
  assert.match(html, /010-3213-3390/, "secondary phone CTA should be visible");
  assert.doesNotMatch(html, /010-1234-5678/, "old placeholder phone number should be removed");
  assert.match(html, /class="[^"]*case-gallery[^"]*"/, "case section should include visual buying cases");
  assert.ok(existsSync(join(root, "styles.css")), "styles.css should exist");
  assert.ok(existsSync(join(root, "script.js")), "script.js should exist");
});

test("items slide stays visual while the standalone price page is removed", () => {
  assert.match(html, /class="[^"]*item-showcase[^"]*"/, "items slide should use an image-led showcase layout");
  assert.match(html, /class="[^"]*item-focus-card[^"]*"/, "items slide should have a prominent visual focus card");
  assert.match(html, /class="[^"]*scan-line[^"]*"/, "items slide should include a scanning animation layer");
  assert.doesNotMatch(html, /href="#price"/, "navigation should not expose a removed price page");
  assert.doesNotMatch(html, /<section id="price"/, "standalone price section should be removed");
  assert.doesNotMatch(html, /class="[^"]*(?:price-|quote-)[^"]*"/, "price-only markup should be removed");
  assert.doesNotMatch(css, /\.(?:price-|quote-)[a-z-]*/, "price-only styles should be removed");
  assert.match(css, /@keyframes\s+scanSweep/, "scan animation should be defined");
});

test("buying process section uses image-led cards without numeric step badges", () => {
  assert.match(
    css,
    /\.market-process\s*\{[\s\S]*display:\s*grid[\s\S]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/,
    "process cards should use a stable five-column grid on desktop",
  );
  assert.match(
    css,
    /\.market-process\s*\{[\s\S]*--process-gap:\s*clamp\(18px,\s*2\.2vw,\s*30px\)/,
    "process cards should keep enough room for connector arrows",
  );
  assert.match(
    css,
    /\.market-process li\s*\{[\s\S]*min-height:\s*250px[\s\S]*padding:\s*clamp\(22px,\s*2\.8vw,\s*34px\)/,
    "process cards should have larger touch-friendly dimensions",
  );
  assert.match(
    html,
    /<ul class="process-list market-process">[\s\S]*<img src="assets\/items\/insert-tip\.png(?:\?v=sharp-20260715)?"[\s\S]*<img src="assets\/cases\/endmill-case\.png(?:\?v=sharp-20260715)?"[\s\S]*<img src="assets\/cases\/chunk-case\.png(?:\?v=sharp-20260715)?"[\s\S]*<img src="assets\/items\/sludge\.png(?:\?v=sharp-20260715)?"[\s\S]*<img src="assets\/cases\/insert-case\.png(?:\?v=sharp-20260715)?"/,
    "process cards should communicate the flow with images",
  );
  assert.doesNotMatch(html, /<span>0[1-5]<\/span>/, "numeric process badges should be removed");
  assert.match(
    css,
    /\.market-process li:not\(:last-child\)::after\s*\{[\s\S]*right:\s*calc\(var\(--process-gap\) \* -1\)[\s\S]*width:\s*var\(--process-gap\)[\s\S]*text-align:\s*center/,
    "process arrows should be centered inside the space between cards",
  );
  assert.match(css, /\.process-visual\s*\{[\s\S]*aspect-ratio:\s*1\.2/, "process images should have a stable visual frame");
  assert.match(
    css,
    /\.process-visual img\s*\{[\s\S]*object-position:\s*center top[\s\S]*transform:\s*scale\(1\.12\)[\s\S]*transform-origin:\s*center top/,
    "process images should crop out source-image whitespace while staying sharp",
  );
});

test("responsive CSS handles tablet and narrow mobile layouts", () => {
  assert.match(css, /body\s*\{[^}]*overflow-x:\s*hidden/s, "body should prevent accidental horizontal scroll");
  assert.match(css, /@media\s*\(max-width:\s*768px\)/, "tablet breakpoint should be defined");
  assert.match(css, /@media\s*\(max-width:\s*480px\)/, "narrow mobile breakpoint should be defined");
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*\.item-showcase/s, "items showcase should be adjusted at tablet size");
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*\.case-gallery/s, "case gallery should be adjusted at tablet size");
  assert.match(
    css,
    /@media\s*\(max-width:\s*640px\)[\s\S]*\.slides\s*\{[\s\S]*scroll-snap-type:\s*none/,
    "mobile pages should use natural scrolling so section edges cannot hide content",
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*640px\)[\s\S]*\.slide\s*\{[\s\S]*overflow:\s*visible/,
    "mobile sections should allow tall content to remain visible",
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*640px\)[\s\S]*\.hero-content\s*\{[\s\S]*min-height:\s*max\(100svh,\s*720px\)/,
    "the mobile hero should grow beyond short viewports when its content needs more room",
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*640px\)[\s\S]*h1\s*\{[\s\S]*font-size:\s*clamp\(2rem,\s*9vw,\s*2\.65rem\)[\s\S]*overflow-wrap:\s*anywhere/,
    "the mobile hero heading should fit narrow screens without horizontal clipping",
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*640px\)[\s\S]*\.hero-copy,[\s\S]*\.section-copy\s*\{[\s\S]*overflow-wrap:\s*anywhere/,
    "mobile descriptive text should wrap before it reaches the viewport edge",
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*640px\)[\s\S]*\.contact-phone-line\s*\{[\s\S]*flex-wrap:\s*wrap/,
    "mobile contact numbers should wrap instead of being clipped horizontally",
  );
});

test("landing page has core metadata and a project visual asset", () => {
  assert.match(html, /<html lang="ko">/, "page language should be Korean");
  assert.match(html, /name="viewport"/, "mobile viewport metadata should be present");
  assert.match(html, /assets\/carbide-hero\.(png|jpg|jpeg|webp)/, "hero should reference the carbide visual asset");
});

test("buying cases section supports visual comparison without duplicated cases", () => {
  assert.match(html, /class="[^"]*case-experience[^"]*"/, "cases section should use the redesigned experience layout");
  assert.match(html, /class="[^"]*case-heading[^"]*"/, "cases section should pair its heading with proof and consultation guidance");
  assert.match(html, /class="[^"]*case-proof[^"]*"/, "cases section should summarize real case totals");
  assert.match(html, /class="[^"]*case-gallery[^"]*"/, "cases section should use one visual comparison gallery");
  assert.equal((html.match(/class="[^"]*case-card[^"]*"/g) ?? []).length, 4, "case gallery should contain four unique cases");
  assert.equal((html.match(/class="[^"]*case-card--featured[^"]*"/g) ?? []).length, 1, "one gallery case should carry visual priority");
  assert.match(html, /class="[^"]*case-cta[^"]*"/, "cases section should keep a direct consultation path");
  assert.match(html, /class="[^"]*case-meta[^"]*"/, "case cards should expose comparable metadata");
  assert.doesNotMatch(html, /class="[^"]*(?:case-spotlight|case-fit-panel)[^"]*"/, "the gallery should not repeat a case in a separate spotlight");
  assert.match(css, /\.case-gallery\s*\{[\s\S]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/, "cases should use a twelve-column editorial gallery");
  assert.match(css, /@media\s*\(max-width:\s*768px\)[\s\S]*\.case-gallery\s*\{[\s\S]*grid-template-columns:\s*1fr/, "case gallery should collapse cleanly on mobile");
});

test("buying case images use high-resolution source assets", () => {
  for (const filename of ["endmill-case.png", "insert-case.png", "sludge-case.png", "chunk-case.png"]) {
    const size = readPngSize(join(root, "assets", "cases", filename));

    assert.ok(size.width >= 1200, `${filename} should be at least 1200px wide`);
    assert.ok(size.height >= 675, `${filename} should be at least 675px tall`);
  }
});

test("buying process item images use high-resolution source assets", () => {
  for (const filename of ["insert-tip.png", "sludge.png"]) {
    const size = readPngSize(join(root, "assets", "items", filename));

    assert.ok(size.width >= 1200, `${filename} should be at least 1200px wide`);
    assert.ok(size.height >= 900, `${filename} should be at least 900px tall`);
  }
});

test("npm run dev starts a local static server", () => {
  assert.equal(
    packageJson.scripts?.dev,
    "python3 -m http.server 4173",
    "dev script should serve the static site on port 4173",
  );
});
