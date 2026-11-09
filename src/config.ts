import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";
import site from "./site.json";

export const siteConfig: SiteConfig = {
	title: site.title,
	subtitle: site.subtitle,
	lang: "zh_CN", // 中文界面；可选 en / zh_TW / ja / ko 等
	themeColor: {
		hue: Number(site.themeHue), // 默认主题色（0-360），访客也可以自己换
		fixed: false, // true 则隐藏访客的主题色选择器
	},
	banner: {
		enable: Boolean(site.bannerEnabled),
		src: site.bannerImage, // 以 / 开头表示相对于 public 目录
		video: {
			enable: Boolean(site.bannerVideoEnabled),
			src: site.bannerVideo || "",
			webm: site.bannerVideoWebm || "",
		},
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
	avatar: site.profileAvatar,
	name: site.profileName,
	bio: site.profileBio,
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
