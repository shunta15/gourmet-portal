/**
 * JS なし(<noscript>)のときの、案 1「留める」の「留めない」完成形。動きを減らす設定のときは site.css 側の同じ規則が効く。
 * 舞台は画面に貼り付かず、3 つの場面を縦に並べる。
 */
export const cpFx1Static =
  ".f1-track{height:auto!important}" +
  ".f1-stage{position:relative!important;height:auto!important;min-height:0!important;padding:96px 0 40px}" +
  ".f1-bg i{display:none!important}.f1-orb,.f1-dots,.f1-hint,.f1-next{display:none!important}" +
  ".f1-lines{position:static!important;height:auto!important;display:grid;gap:18px;margin-top:20px}" +
  ".f1-l{position:static!important;opacity:1!important;translate:none!important;scale:none!important;color:inherit!important}" +
  ".f1-win{position:relative!important;right:auto!important;top:auto!important;left:auto!important;width:min(86vw,520px)!important;margin:28px 16px 0!important;translate:none!important;rotate:none!important;scale:none!important}" +
  ".f1-win .f1-wb img:not(:first-child){display:none}.f1-win .f1-wb img{opacity:1!important}" +
  ".f1-cta{position:relative!important;left:auto!important;bottom:auto!important;margin:24px 16px 0!important}";
