export type Platform = "win" | "mac" | "linux" | "android" | "ios" | "other";

export default class PlatformUtils {
    static getPlatform(): Platform {
        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.includes("win")) {
            return "win";
        } else if (userAgent.includes("mac")) {
            return "mac";
        } else if (userAgent.includes("linux")) {
            return "linux";
        } else if (userAgent.includes("android")) {
            return "android";
        } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
            return "ios";
        } else {
            return "other";
        }
    }

    static isMobile(): boolean {
        const platform = PlatformUtils.getPlatform();
        return platform === "android" || platform === "ios";
    }

    static isDesktop(): boolean {
        const platform = PlatformUtils.getPlatform();
        return platform === "win" || platform === "mac" || platform === "linux";
    }

    static isApple(): boolean {
        const platform = PlatformUtils.getPlatform();
        return platform === "mac" || platform === "ios";
    }
}