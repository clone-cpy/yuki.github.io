import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "林间小筑",
	subtitle: "nzh 的个人博客",
	lang: "zh_CN", // 中文界面；可选 en / zh_TW / ja / ko 等
	themeColor: {
		hue: 250, // 默认主题色（0-360），访客也可以自己换
		fixed: false, // true 则隐藏访客的主题色选择器
	},
	banner: {
		enable: true,
		src: "/uploads/banner.webp", // 以 / 开头表示相对于 public 目录
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 3,
	},
	favicon: [
		{
			src: "/favicon/favicon-192.png",
			sizes: "192x192",
		},
		{
			src: "/favicon/favicon-32.png",
			sizes: "32x32",
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "GitHub",
			url: "https://github.com/clone-cpy/yuki.github.io",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/uploads/avatar.webp",
	name: "nzh",
	bio: "写代码，也写一点文字。",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/clone-cpy",
		},
		{
			name: "RSS",
			icon: "fa6-solid:rss",
			url: "https://clone-cpy.github.io/yuki.github.io/rss.xml",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: false,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
