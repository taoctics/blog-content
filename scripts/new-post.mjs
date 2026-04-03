import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, "..");
const configPath = path.join(rootDirectory, "blog-content.config.json");

if (!fs.existsSync(configPath)) {
  console.error(`Missing config file: ${path.relative(rootDirectory, configPath)}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const postsDirectory = path.join(
  rootDirectory,
  config.postsDirectory || "posts"
);
const templatePath = path.join(
  rootDirectory,
  config.templatePath || "templates/post.md"
);
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const title = args.filter((arg) => arg !== "--dry-run").join(" ").trim();

if (!title) {
  console.error('Usage: npm run new:post -- [--dry-run] "文章标题"');
  process.exit(1);
}

if (!fs.existsSync(templatePath)) {
  console.error(`Missing template file: ${path.relative(rootDirectory, templatePath)}`);
  process.exit(1);
}

function slugify(input) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function yamlString(value) {
  return JSON.stringify(value);
}

function yamlInlineArray(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return "[]";
  }

  return `[${values.map((value) => JSON.stringify(value)).join(", ")}]`;
}

const slug = slugify(title);

if (!slug) {
  console.error("Unable to generate a slug from the provided title.");
  process.exit(1);
}

const targetDirectory = path.join(postsDirectory, slug);
const targetPath = path.join(targetDirectory, "index.md");
const assetsDirectory = path.join(targetDirectory, "assets");
const gitkeepPath = path.join(assetsDirectory, ".gitkeep");
const legacyTargetPath = path.join(postsDirectory, `${slug}.md`);
const existingPath = fs.existsSync(targetDirectory)
  ? targetDirectory
  : fs.existsSync(legacyTargetPath)
    ? legacyTargetPath
    : null;

if (existingPath) {
  console.error(`Post already exists: ${path.relative(rootDirectory, existingPath)}`);
  process.exit(1);
}

fs.mkdirSync(postsDirectory, { recursive: true });

const today = formatLocalDate(new Date());
const defaults = config.defaults || {};
const summaryTemplate =
  typeof defaults.summary === "string" && defaults.summary.trim()
    ? defaults.summary
    : "写一段关于「{{title}}」的摘要。";
const summary = summaryTemplate
  .replaceAll("{{title}}", title)
  .replaceAll("{{slug}}", slug)
  .replaceAll("{{date}}", today);
const template = fs.readFileSync(templatePath, "utf8");
const content = template
  .replace(/__TITLE__/g, yamlString(title))
  .replace(/__DATE__/g, yamlString(today))
  .replace(/__SUMMARY__/g, yamlString(summary))
  .replace(
    /__CATEGORIES__/g,
    yamlInlineArray(Array.isArray(defaults.categories) ? defaults.categories : [])
  )
  .replace(
    /__TAGS__/g,
    yamlInlineArray(Array.isArray(defaults.tags) ? defaults.tags : [])
  )
  .replace(
    /__COLLECTIONS__/g,
    yamlInlineArray(Array.isArray(defaults.collections) ? defaults.collections : [])
  )
  .replace(/__DRAFT__/g, String(Boolean(defaults.draft)));

if (dryRun) {
  console.log(`Would create ${path.relative(rootDirectory, targetPath)}`);
  console.log(`Would create ${path.relative(rootDirectory, gitkeepPath)}`);
  console.log("");
  console.log(content);
  process.exit(0);
}

fs.mkdirSync(assetsDirectory, { recursive: true });
fs.writeFileSync(targetPath, content);
fs.writeFileSync(gitkeepPath, "");

console.log(`Created ${path.relative(rootDirectory, targetPath)}`);
console.log(`Created ${path.relative(rootDirectory, gitkeepPath)}`);
