import { visit } from "unist-util-visit";

/**
 * GitHub Pages 项目站点部署在 /<repo>/ 子路径下。
 * Markdown 里以 "/" 开头的图片、链接不会被 Astro 自动加上 base，
 * 这里统一补上，保证正文配图在子路径下也能正常显示。
 */
function withBase(value, base) {
	if (typeof value !== "string") return value;
	if (!value.startsWith("/") || value.startsWith("//")) return value;
	return base.replace(/\/$/, "") + value;
}

export function rehypeBasePath(options = {}) {
	const base = options.base || import.meta.env.BASE_URL || "/";
	return (tree) => {
		visit(tree, "element", (node) => {
			if (!node.properties) return;
			if (node.tagName === "img" || node.tagName === "video" || node.tagName === "source") {
				node.properties.src = withBase(node.properties.src, base);
			}
			if (node.tagName === "a") {
				node.properties.href = withBase(node.properties.href, base);
			}
		});
	};
}
