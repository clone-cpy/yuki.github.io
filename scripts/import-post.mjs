#!/usr/bin/env node
/**
 * 导入 Markdown 文章
 *
 * 用法：
 *   corepack pnpm import ./我的文章.md
 *   corepack pnpm import a.md b.md --publish
 *   corepack pnpm import post.md --slug=my-post --force
 *
 * 会做这些事：
 *   - 读取/生成 frontmatter（title、published、description、tags、category、draft）
 *   - 把 Markdown 里的相对路径图片复制到 public/uploads，并改写成 /uploads/...
 *   - 写入 src/content/posts/<slug>.md
 *   - 加 --publish 时自动 git add/commit/push
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = path.join(ROOT, "src", "content", "posts");
const UPLOAD_DIR = path.join(ROOT, "public", "uploads");

const args = process.argv.slice(2);
const options = {
	publish: args.includes("--publish"),
	force: args.includes("--force"),
	slug: (args.find((arg) => arg.startsWith("--slug=")) || "").split("=")[1] || "",
};
const files = args.filter((arg) => !arg.startsWith("--"));
if (!files.length) {
	console.error("用法: corepack pnpm import <文章.md> [更多.md] [--publish] [--slug=xxx] [--force]");
	process.exit(1);
}

function today() {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function stripMarkdown(text) {
	return text
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
		.replace(/[#>*_`~]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function parseFrontmatter(text) {
	if (!text.startsWith("---")) return { data: {}, body: text, had: false };
	const end = text.indexOf("\n---", 3);
	if (end < 0) return { data: {}, body: text, had: false };
	const raw = text.slice(3, end).replace(/^\n/, "");
	const body = text.slice(end + 4).replace(/^\n/, "");
	const data = {};
	let currentKey = null;

	for (const line of raw.split("\n")) {
		if (!line.trim() || line.trim().startsWith("#")) continue;
		const listItem = line.match(/^\s+-\s+(.*)$/);
		if (listItem && currentKey) {
			if (!Array.isArray(data[currentKey])) data[currentKey] = [];
			data[currentKey].push(String(listItem[1]).replace(/^["']|["']$/g, ""));
			continue;
		}
		const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (!match) continue;
		const key = match[1];
		let value = match[2].trim();
		currentKey = key;
		if (!value) {
			data[key] = [];
			continue;
		}
		if (value.startsWith("[") && value.endsWith("]")) {
			data[key] = value
				.slice(1, -1)
				.split(",")
				.map((item) => item.trim().replace(/^["']|["']$/g, ""))
				.filter(Boolean);
			continue;
		}
		if (value === "true" || value === "false") {
			data[key] = value === "true";
			continue;
		}
		data[key] = value.replace(/^["']|["']$/g, "");
	}
	return { data, body, had: true };
}

function quote(value) {
	return JSON.stringify(String(value));
}

function serializeFrontmatter(data, body) {
	const lines = ["---"];
	lines.push(`title: ${quote(data.title)}`);
	lines.push(`published: ${data.published}`);
	if (data.updated) lines.push(`updated: ${data.updated}`);
	lines.push(`description: ${quote(data.description || "")}`);
	if (data.image) lines.push(`image: ${quote(data.image)}`);
	const tags = Array.isArray(data.tags) ? data.tags : [];
	lines.push(`tags: [${tags.map((tag) => quote(tag)).join(", ")}]`);
	if (data.category) lines.push(`category: ${quote(data.category)}`);
	lines.push(`draft: ${data.draft === true}`);
	lines.push("---", "");
	return `${lines.join("\n")}${body.replace(/^\n+/, "")}`;
}

function safeName(name) {
	const ext = path.extname(name);
	const stem = path
		.basename(name, ext)
		.replace(/[^\p{L}\p{N}._-]+/gu, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 60);
	return `${stem || "asset"}${ext.toLowerCase()}`;
}

function copyAsset(rawPath, baseDir) {
	const clean = rawPath.replace(/^<|>$/g, "").split(" ")[0];
	if (!clean || /^(https?:|data:|\/|#)/i.test(clean)) return null;
	const source = path.resolve(baseDir, decodeURIComponent(clean));
	if (!fs.existsSync(source) || !fs.statSync(source).isFile()) return null;
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
	const base = safeName(source);
	const hash = crypto.randomBytes(3).toString("hex");
	const filename = `${path.basename(base, path.extname(base))}-${hash}${path.extname(base)}`;
	fs.copyFileSync(source, path.join(UPLOAD_DIR, filename));
	return `/uploads/${filename}`;
}

function processImages(body, frontmatter, baseDir) {
	const replaced = body.replace(/(!\[[^\]]*\]\()([^)\s]+)(\))/g, (whole, open, url, close) => {
		const copied = copyAsset(url, baseDir);
		return copied ? `${open}${copied}${close}` : whole;
	});
	if (frontmatter.image) {
		const copied = copyAsset(frontmatter.image, baseDir);
		if (copied) frontmatter.image = copied;
	}
	return replaced;
}

for (const input of files) {
	const source = path.resolve(process.cwd(), input);
	if (!fs.existsSync(source)) {
		console.error(`找不到文件：${input}`);
		continue;
	}
	const raw = fs.readFileSync(source, "utf8");
	const { data, body, had } = parseFrontmatter(raw);
	const dir = path.dirname(source);

	let markdown = body;
	let title = data.title;
	if (!title) {
		const heading = markdown.match(/^#\s+(.+)$/m);
		title = heading ? heading[1].trim() : path.basename(source, path.extname(source));
		if (heading) markdown = markdown.replace(/^#\s+.+\n?/, "");
	}

	const firstParagraph = markdown
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.find((block) => block && !block.startsWith("#") && !block.startsWith("!"));
	const description = data.description || (firstParagraph ? stripMarkdown(firstParagraph).slice(0, 90) : "");

	const frontmatter = {
		title,
		published: data.published || today(),
		updated: data.updated,
		description,
		image: data.image || "",
		tags: Array.isArray(data.tags) ? data.tags : [],
		category: data.category || "",
		draft: data.draft === true,
	};

	const withImages = processImages(markdown, frontmatter, dir);

	const slug =
		options.slug ||
		path
			.basename(source, path.extname(source))
			.trim()
			.replace(/\s+/g, "-")
			.replace(/[\\/:*?"<>|]/g, "")
			.slice(0, 80) ||
		`post-${Date.now()}`;

	fs.mkdirSync(POSTS_DIR, { recursive: true });
	const target = path.join(POSTS_DIR, `${slug}.md`);
	if (fs.existsSync(target) && !options.force) {
		console.error(`已存在：src/content/posts/${slug}.md（加 --force 覆盖）`);
		continue;
	}
	fs.writeFileSync(target, serializeFrontmatter(frontmatter, withImages), "utf8");
	console.log(`✓ 已导入 ${input} -> src/content/posts/${slug}.md`);
	if (!had) console.log("  （原文件没有 frontmatter，已自动补全，建议检查标题/日期/标签）");
}

if (options.publish) {
	try {
		execFileSync("git", ["add", "-A"], { cwd: ROOT, stdio: "inherit" });
		execFileSync("git", ["commit", "-m", "Import Markdown post"], { cwd: ROOT, stdio: "inherit" });
		execFileSync("git", ["push"], { cwd: ROOT, stdio: "inherit" });
		console.log("✓ 已推送，GitHub Actions 会自动构建");
	} catch (error) {
		console.error("自动发布失败，请手动执行 git add/commit/push");
	}
} else {
	console.log("\n预览：corepack pnpm dev");
	console.log("发布：git add -A && git commit -m \"新增文章\" && git push");
}
