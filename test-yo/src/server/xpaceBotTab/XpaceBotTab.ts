import { PreventIframe } from "express-msteams-host";

/**
 * Used as place holder for the decorators
 */
@PreventIframe("/xpaceBotTab/index.html")
@PreventIframe("/xpaceBotTab/config.html")
@PreventIframe("/xpaceBotTab/remove.html")
export class XpaceBotTab {
}
