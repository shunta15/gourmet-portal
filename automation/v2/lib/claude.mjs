/**
 * automation/v2/lib/claude.mjs — `claude -p --model sonnet` を無人で呼ぶ
 *
 * 守ること(廃止メモ §5-8・9):
 *  - 認証が切れている・ネットが切れているときは、店のせいにしない(環境エラーとして最初に止める。preflight)
 *  - 道具は Read / Write / WebFetch / WebSearch だけ(Bash・サブエージェントは渡さない)
 *  - 作業用の空のフォルダを cwd にして(リポジトリの CLAUDE.md を読ませない)、作業フォルダだけ --add-dir で見せる
 *  - ユーザー設定(終了時のフックなど)は読まない(--setting-sources project)
 *  - 認証は、利用者が自分の端末で作った長期トークンを環境変数 CLAUDE_CODE_OAUTH_TOKEN に入れて渡す
 *    (`claude setup-token`。トークンはこのリポジトリに書かない・画面に出さない)。環境変数が無ければ、端末の claude のログインを使う
 *  - 完了はログの「COMPLETED」でなく、出力ファイルの実在と中身で判定する(呼び出し側)
 */
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const CLEAN_CWD = path.join(os.tmpdir(), "machinowa-v2-claude-cwd");

export const AUTH_HELP =
  "claude が認証切れです。端末で `claude setup-token`(ブラウザで承認)を実行し、表示された長期トークンを " +
  "`export CLAUDE_CODE_OAUTH_TOKEN=...` で渡してから write.mjs を回してください(トークンはファイルに書かない)。";

/** claude を 1 回呼ぶ。{ ok, text, isError, costUsd, durationMs, stderr, timedOut } */
export function runClaude({ prompt, addDirs = [], model = "sonnet", tools = "Read,Write,WebFetch,WebSearch", timeoutMs = 25 * 60_000, bin = process.env.MACHINOWA_CLAUDE_BIN || "claude" }) {
  mkdirSync(CLEAN_CWD, { recursive: true });
  const args = [
    "-p",
    "--model", model,
    "--tools", tools,
    "--allowedTools", tools.split(",").join(" "),
    "--permission-mode", "dontAsk",
    "--setting-sources", "project",
    "--no-session-persistence",
    "--disable-slash-commands",
    "--output-format", "json",
  ];
  for (const d of addDirs) args.push("--add-dir", d);
  return new Promise((resolve) => {
    const t0 = Date.now();
    const child = spawn(bin, args, { cwd: CLEAN_CWD, env: process.env, stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5000);
    }, timeoutMs);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ ok: false, text: "", isError: true, costUsd: 0, durationMs: Date.now() - t0, stderr: `起動できない: ${e.message}`, timedOut: false });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      let j = null;
      try {
        j = JSON.parse(out);
      } catch {
        /* JSON でなければ text のまま */
      }
      const text = j?.result ?? out;
      const isError = !!(j?.is_error) || (code !== 0 && !j);
      resolve({
        ok: !isError && !timedOut && code === 0,
        text: String(text || "").trim(),
        isError,
        costUsd: j?.total_cost_usd ?? null,
        durationMs: Date.now() - t0,
        stderr: err.trim().slice(-600),
        timedOut,
        turns: j?.num_turns ?? null,
      });
    });
    child.stdin.end(prompt);
  });
}

const AUTH_RE = /authenticate|OAuth|login|not logged in|expired|401|credential/i;
const NET_RE = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network|fetch failed|getaddrinfo|offline/i;

/**
 * 実行前の確認。認証・ネットが壊れているなら、店に触る前に止める(店のエラーにしない)。
 * { ok:true } か { ok:false, kind:'auth'|'net'|'other', message }
 */
export async function preflight() {
  const r = await runClaude({ prompt: "OK とだけ答えてください。", tools: "", timeoutMs: 90_000 });
  if (r.ok && r.text) return { ok: true, durationMs: r.durationMs };
  const msg = `${r.text} ${r.stderr}`.trim();
  if (AUTH_RE.test(msg)) return { ok: false, kind: "auth", message: `${msg.slice(0, 200)} — ${AUTH_HELP}` };
  if (NET_RE.test(msg)) return { ok: false, kind: "net", message: msg.slice(0, 200) };
  return { ok: false, kind: "other", message: msg.slice(0, 300) || (r.timedOut ? "時間切れ" : "原因不明") };
}
